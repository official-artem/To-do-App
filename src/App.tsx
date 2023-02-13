import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  addTodos,
  changeTodo,
  deleteTodo,
  getTodos,
} from './api/todos';

import { AuthContext } from './components/Auth/AuthContext';
import { ErrorMessage } from './components/ErrorMessage';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList.tsx';
import { LoadedTodos } from './todoContext';
import { TodoLengthContext } from './TodoLengthContext';
import { Filter } from './types/Filter';
import { Todo } from './types/Todo';
import { getCompletedTodoIds } from './utils/getCompletedTodos';

export const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useContext(AuthContext);
  const newTodoField = useRef<HTMLInputElement>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tempNewTodo, setTempNewTodo] = useState<Todo | null>(null);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filterType, setFilterType] = useState(Filter.ALL);
  const [errorMessage, setErrorMessage] = useState('');
  const [processingTodoIds, setProcessingTodoId] = useState<number[]>([]);
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const clearTitle = () => {
    setNewTodoTitle('');
  };

  const handleChangeTodo = useCallback(
    async (todoId: number, params: any) => {
      setProcessingTodoId(prevIds => {
        if (!prevIds.includes(todoId)) {
          return [...prevIds, todoId];
        }

        return prevIds;
      });

      try {
        const updatedTodo = await changeTodo(todoId, params);

        setTodos(prev => prev.map(todo => {
          return updatedTodo.id !== todo.id
            ? todo
            : {
              id: updatedTodo.id,
              userId: updatedTodo.userId,
              title: updatedTodo.title,
              completed: updatedTodo.completed,
            };
        }));
      } finally {
        setProcessingTodoId(prev => prev.filter(id => id !== todoId));
      }
    }, [],
  );

  const handleDeleteTodo = useCallback(
    async (todoId: number) => {
      try {
        setProcessingTodoId(prev => [...prev, todoId]);

        await deleteTodo(todoId);

        setTodos(currentTodos => {
          return currentTodos.filter(todo => todo.id !== todoId);
        });
      } catch (error) {
        setErrorMessage('Unable to delete a todo');
      } finally {
        setProcessingTodoId(prev => prev.filter(id => id !== todoId));
      }
    }, [],
  );

  const handleItemsLeft = useCallback(
    () => {
      return todos.filter(todo => !todo.completed).length;
    }, [todos],
  );

  const handleAddTodo = useCallback(
    async (fieldsToCreate: Omit<Todo, 'id'>) => {
      try {
        if (newTodoTitle) {
          const newTodo = await addTodos(fieldsToCreate);

          setTodos(prev => [...prev, newTodo]);

          clearTitle();
        }
      } catch {
        setErrorMessage('Unable to add todo');

        throw Error('Error while adding todo');
      } finally {
        setIsAddingTodo(false);
        setTempNewTodo(null);
      }
    }, [newTodoTitle],
  );

  const visibleTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filterType === Filter.ACTIVE) {
        return !todo.completed;
      }

      if (filterType === Filter.COMPLITED) {
        return todo.completed;
      }

      return true;
    });
  }, [todos, filterType]);

  const handleClickMessage = () => {
    setErrorMessage('');
  };

  const handleFilterType = useCallback((value: Filter) => {
    setFilterType(value);
  }, []);

  useEffect(() => {
    // focus the element with `ref={newTodoField}`
    if (newTodoField.current) {
      newTodoField.current.focus();
    }

    if (user) {
      getTodos(user.id)
        .then(result => {
          setTodos(result);
        })
        .catch(() => {
          setErrorMessage('Todos not found');
        });
    }
  }, [user]);

  const handleClearCompleted = useCallback(
    () => {
      const completedTodoIds = getCompletedTodoIds(todos);

      completedTodoIds.forEach(id => handleDeleteTodo(id));
    }, [handleDeleteTodo, todos],
  );

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          newTodoField={newTodoField}
          title={newTodoTitle}
          setTitle={setNewTodoTitle}
          onAddTodo={handleAddTodo}
          showError={setErrorMessage}
        />

        {visibleTodos && (
          <LoadedTodos.Provider value={processingTodoIds}>
            <TodoList
              todos={visibleTodos}
              onDeleteItem={handleDeleteTodo}
              handleChangeTodo={handleChangeTodo}
              tempNewTodo={tempNewTodo}
              processingTodoIds={processingTodoIds}
              isAddingTodo={isAddingTodo}
            />
          </LoadedTodos.Provider>
        )}

        {!!todos.length && (
          <TodoLengthContext.Provider value={handleItemsLeft()}>
            <Footer
              onSelectFilter={handleFilterType}
              filterType={filterType}
              onClearCompleted={handleClearCompleted}
            />
          </TodoLengthContext.Provider>
        )}
      </div>

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          onCloseError={handleClickMessage}
        />
      )}
    </div>
  );
};

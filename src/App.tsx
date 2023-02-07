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
import { LoadedUser } from './todoContext';
import { TodoLengthContext } from './TodoLengthContext';
import { Filter } from './types/Filter';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useContext(AuthContext);
  const newTodoField = useRef<HTMLInputElement>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filterType, setFilterType] = useState(Filter.ALL);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUserLoading, setIsUserLoading] = useState(false);
  const clearTitle = () => {
    setNewTodoTitle('');
  };

  const handleChangeTodo = useCallback(
    (todoId: number, params: any) => {
      changeTodo(todoId, params)
        .then((updatedTodo) => {
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
        });
    }, [],
  );

  const handleDeleteItem = useCallback(
    async (todoId: number) => {
      deleteTodo(todoId)
        .then(() => (
          setTodos(currentTodos => currentTodos
            .filter(todo => todo.id !== todoId))
        ))
        .catch(() => {
          setErrorMessage('Unable to delete a todo');
        });
    }, [],
  );

  const handleItemsLeft = useCallback(
    () => {
      return todos.filter(todo => !todo.completed).length;
    }, [todos],
  );

  const handleAddTodo = useCallback(
    async () => {
      setIsUserLoading(true);

      if (newTodoTitle) {
        const todo = await addTodos(newTodoTitle, user?.id, false);

        setTodos(prev => [...prev, todo]);

        clearTitle();
      }

      if (!newTodoTitle) {
        setErrorMessage('Title can\'t be empty');
      }

      setIsUserLoading(false);
    }, [user?.id, newTodoTitle],
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
      setTodos(prev => {
        return prev.filter(todo => {
          if (todo.completed) {
            handleDeleteItem(todo.id);

            return false;
          }

          return true;
        });
      });
    }, [handleDeleteItem],
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
        />

        {visibleTodos && (
          <LoadedUser.Provider value={isUserLoading}>
            <TodoList
              todos={visibleTodos}
              onDeleteItem={handleDeleteItem}
              handleChangeTodo={handleChangeTodo}
            />
          </LoadedUser.Provider>
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

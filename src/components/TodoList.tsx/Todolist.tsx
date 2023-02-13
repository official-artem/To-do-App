import { FC, memo, useState } from 'react';
import { Todo } from '../../types/Todo';
import { TodoItem } from '../TodoItem/TodoItem';

interface Props {
  todos: Todo[] | [];
  onDeleteItem: (todoId: number) => void
  handleChangeTodo: (todoId: number, ...params: any) => void
  tempNewTodo: Todo | null;
  processingTodoIds: number[]
  isAddingTodo: boolean;
}

export const TodoList: FC<Props> = memo(
  ({
    todos,
    onDeleteItem,
    handleChangeTodo,
    tempNewTodo,
    processingTodoIds,
    isAddingTodo,
  }) => {
    const [selectedTodo, setSelectedTodo] = useState(0);

    return (
      <section
        className="todoapp__main"
        data-cy="TodoList"
      >
        {todos.map(todo => (

          <TodoItem
            key={todo.id}
            todo={todo}
            onDeleteItem={onDeleteItem}
            onChangeTodo={handleChangeTodo}
            selectedTodo={selectedTodo}
            setSelectedTodo={setSelectedTodo}
            processingTodoIds={processingTodoIds}
          />
        ))}

        {tempNewTodo && (
          <TodoItem
            todo={tempNewTodo}
            isAddingTodo={isAddingTodo}
            onDeleteItem={onDeleteItem}
            onChangeTodo={handleChangeTodo}
            selectedTodo={selectedTodo}
            setSelectedTodo={setSelectedTodo}
            processingTodoIds={processingTodoIds}
          />
        )}
      </section>
    );
  },
);

import React, { FC, memo, useContext } from 'react';
import { Todo } from '../../types/Todo';
import { AuthContext } from '../Auth/AuthContext';

export interface Props {
  newTodoField: React.RefObject<HTMLInputElement>;
  title: string,
  setTitle: React.Dispatch<React.SetStateAction<string>>,
  onAddTodo: (fieldsForCreate: Omit<Todo, 'id'>) => Promise<void>;
  showError: (string: string) => void
}

export const Header: FC<Props> = memo(
  ({
    newTodoField,
    title,
    setTitle,
    onAddTodo,
    showError,
  }) => {
    const user = useContext(AuthContext);

    const handleAddTodo = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!title) {
        showError('Title is required');

        return;
      }

      if (!user) {
        showError('User not found');

        return;
      }

      await onAddTodo({
        title,
        userId: user.id,
        completed: false,
      });

      setTitle('');
    };

    return (
      <header className="todoapp__header">
        <form
          onSubmit={handleAddTodo}
        >
          <button
            data-cy="ToggleAllButton"
            type="button"
            className="todoapp__toggle-all active"
            aria-label="toggle"
          />

          <input
            type="text"
            value={title}
            ref={newTodoField}
            data-cy="NewTodoField"
            className="todoapp__new-todo"
            placeholder="What needs to be done?"
            onChange={(event) => setTitle(event.target.value)}
          />
        </form>

      </header>
    );
  },
);

import { FC, memo } from 'react';
import cn from 'classnames';

interface Props {
  isLoadedUser: boolean;
}

export const TodoLoader: FC<Props> = memo(
  ({ isLoadedUser }) => {
    return (
      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': isLoadedUser,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    );
  },
);

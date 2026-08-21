"""theme_system_and_game_customisation

Revision ID: 33e5a3989552
Revises: a9ad30a19763
Create Date: 2026-08-11 16:27:55.931575

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '33e5a3989552'
down_revision: Union[str, Sequence[str], None] = 'a9ad30a19763'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create themes table
    op.create_table(
        'themes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('is_preset', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('room_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # 2. Create theme_words table
    op.create_table(
        'theme_words',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('theme_id', sa.Integer(), nullable=False),
        sa.Column('word', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.ForeignKeyConstraint(['theme_id'], ['themes.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # 3. Add new columns to games (server_default required by SQLite for NOT NULL)
    op.add_column('games', sa.Column('theme_id', sa.Integer(), nullable=True))
    op.add_column('games', sa.Column('choosing_time', sa.Integer(), nullable=False, server_default=sa.text('30')))
    op.add_column('games', sa.Column('guessing_time', sa.Integer(), nullable=False, server_default=sa.text('60')))
    op.add_column('games', sa.Column('round_ended', sa.Integer(), nullable=False, server_default=sa.text('-1')))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('games', 'round_ended')
    op.drop_column('games', 'guessing_time')
    op.drop_column('games', 'choosing_time')
    op.drop_column('games', 'theme_id')
    op.drop_table('theme_words')
    op.drop_table('themes')

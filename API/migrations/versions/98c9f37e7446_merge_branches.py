"""merge branches

Revision ID: 98c9f37e7446
Revises: 017eccd945ea
Create Date: 2026-02-25 06:11:16.717695

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '98c9f37e7446'
down_revision: Union[str, Sequence[str], None] = '017eccd945ea'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass

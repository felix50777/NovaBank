from datetime import datetime
from ..models.user import db
import uuid

class Card(db.Model):
    __tablename__ = "cards"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    card_number = db.Column(db.String(16), unique=True, nullable=False, default=lambda: str(uuid.uuid4().int)[:16])
    card_type = db.Column(db.String(10), nullable=False)  # 'debito' o 'credito'
    balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="cards")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "card_number": self.card_number,
            "card_type": self.card_type,
            "balance": self.balance,
            "created_at": self.created_at.isoformat()
        }

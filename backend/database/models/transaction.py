from backend.database.models import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    sender_account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False)
    receiver_account_id = db.Column(db.Integer, db.ForeignKey("accounts.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.String(255))

    sender_account = db.relationship("Account", foreign_keys=[sender_account_id], backref="sent_transactions")
    receiver_account = db.relationship("Account", foreign_keys=[receiver_account_id], backref="received_transactions")

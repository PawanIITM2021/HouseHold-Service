from flask_login import current_user
from flask_security import RoleMixin, UserMixin
from flask_sqlalchemy import SQLAlchemy
from flask_security import current_user, auth_required

db = SQLAlchemy()


class RolesUsers(db.Model):
    __tablename__ = 'roles_users'
    id = db.Column(db.Integer(), primary_key=True)
    user_id = db.Column('user_id', db.Integer(), db.ForeignKey('users.id'))
    role_id = db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))


class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer(), primary_key=True)
    name = db.Column(db.String(80), unique=True)
    discription = db.Column(db.String(255))


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    name = db.Column(db.String(30))
    email = db.Column(db.String(), unique=True)
    password = db.Column(db.String(255))
    active = db.Column(db.Boolean())
    fav_service = db.Column(db.Integer)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    roles = db.relationship('Role', secondary='roles_users',
                            backref=db.backref('users', lazy='dynamic'))


class Service(db.Model): 
    __tablename__ = 'services'
    service_id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    expert = db.Column(db.String)
    prologue = db.Column(db.Text)
    title = db.Column(db.String(100))
    section_id = db.Column(db.Integer, db.ForeignKey('sections.section_id'))
    discription = db.Column(db.Text())
    image = db.Column(db.String)
    section = db.relationship('Section', backref='services')

    @property
    def num_of_service_pending_for_me(self):
        rqs = ServiceRequest.query.filter_by(user_id=current_user.id, is_approved=True,
                                          is_revoked=False, is_returned=False).count()
        rqs2 = ServiceRequest.query.filter_by(user_id=current_user.id, is_approved=False,
                                           is_rejected=False, is_revoked=False, is_returned=False).count()
        return rqs+rqs2

    @property
    def is_approved_for_me(self):
        rqs = ServiceRequest.query.filter_by(service_id=self.service_id, is_approved=True, is_returned=False).all()
        return True if current_user.id in [request.user_id for request in rqs] else False

    @property
    def request_id(self):
        if self.is_approved_for_me:
            qs = ServiceRequest.query.filter_by(service_id=self.service_id, is_approved=True, is_returned=False,
                                             user_id=current_user.id).first()
            return qs.id
        else:
            return None

    @property
    def wrote_review(self):
        rqs = Feedback.query.filter_by(service_id=self.service_id).all()
        return True if current_user.id in [request.user_id for request in rqs] else False

    @property
    def is_pending_for_me(self):
        rqs = ServiceRequest.query.filter_by(service_id=self.service_id, is_approved=False, is_rejected=False,
                                          is_revoked=False).all()
        return True if current_user.id in [request.user_id for request in rqs] else False


class ServiceRequest(db.Model):
    __tablename__ = 'service_requests'
    id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'))
    is_approved = db.Column(db.Boolean, default=False, nullable=True)
    is_rejected = db.Column(db.Boolean, default=False, nullable=True)
    is_returned = db.Column(db.Boolean, default=False, nullable=True)
    is_revoked = db.Column(db.Boolean, default=False, nullable=True)
    rejection_reason = db.Column(db.String(100), nullable=True)
    issue_date = db.Column(db.Date, nullable=True)
    return_date = db.Column(db.Date, nullable=True)
    user = db.relationship('User', backref='requests')
    service = db.relationship('Service', backref='requests')


class Section(db.Model):
    __tablename__ = 'sections'
    section_id = db.Column(db.Integer(), autoincrement=True, primary_key=True)
    section_name = db.Column(db.String(25))
    section_discription = db.Column(db.String(50))
    section_icon = db.Column(db.String(10), nullable=True)
    date_created = db.Column(db.Date)


class Feedback(db.Model):
    __tablename__ = 'feedbacks'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    service_id = db.Column(db.Integer, db.ForeignKey('services.service_id'))
    feedback = db.Column(db.String)
    user = db.relationship('User', backref='feedbacks')
    service = db.relationship('Service', backref='feedbacks')


class DailyVisit(db.Model):
    __tablename__ = 'daily_visits'
    id = db.Column(db.Integer, autoincrement=True, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    date = db.Column(db.Date)
    user = db.relationship('User', backref='visits')

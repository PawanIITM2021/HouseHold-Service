import base64
import random
from datetime import datetime
from io import BytesIO
import matplotlib

from backend.instances import cache

matplotlib.use('Agg')
import matplotlib.pyplot as plt
from flask import request, jsonify
from flask_restful import Resource, Api, reqparse, fields, marshal
from flask_security import current_user, auth_required, roles_required
from sqlalchemy import text
from werkzeug.utils import secure_filename

from backend.models import Service, db,User, Section, ServiceRequest, Feedback, DailyVisit


def log_user_visits():
    if current_user is not None and "member" in current_user.roles:
        visited = DailyVisit.query.filter_by(user_id=current_user.id,
                                             date=datetime.today().strftime('%Y-%m-%d')).count()
        if visited == 0:
            vs = DailyVisit(user_id=current_user.id, date=datetime.today())
            db.session.add(vs)
            db.session.commit()


api = Api(prefix='/api')

user = {
    'id': fields.Integer,
    'name': fields.String,
    'email': fields.String
}
review = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'service_id': fields.Integer,
    'feedback': fields.String,
    'user': fields.Nested(user),
}

section_marshal_fields = {
    'section_id': fields.Integer,
    'section_name': fields.String,
    'section_icon': fields.String,
    'section_discription': fields.String,
    'date_created': fields.DateTime(dt_format='iso8601'),
    'services': fields.Nested({
        'service_id': fields.Integer,
        'prologue': fields.String,
        'expert': fields.String,
        'section_id': fields.Integer,
        'title': fields.String,
        'discription': fields.String,
        'image': fields.String,
        'is_pending_for_me': fields.Boolean,
        'is_approved_for_me': fields.Boolean,
        'num_of_service_pending_for_me': fields.Integer,
    })
}

service_marshal_fields = {
    'service_id': fields.Integer,
    'prologue': fields.String,
    'expert': fields.String,
    'section_id': fields.Integer,
    'title': fields.String,
    'discription': fields.String,
    'image': fields.String,
    'section': fields.Nested(section_marshal_fields),
    # 'approved_requests': fields.Nested(service_requests_marshal_field),
    # 'pending_requests': fields.Nested(service_requests_marshal_field),
    'is_pending_for_me': fields.Boolean,
    'is_approved_for_me': fields.Boolean,
    'wrote_review': fields.Boolean,
    'request_id': fields.Raw,
    'requests': fields.Nested({
        'id': fields.Integer,
        'user_id': fields.Integer,
        'user': fields.Nested(user),
        'service_id': fields.Integer,
        'is_approved': fields.Boolean,
        'is_rejected': fields.Boolean,
        'is_returned': fields.Boolean,
        'is_revoked': fields.Boolean,
        'rejection_reason': fields.String,
        'issue_date': fields.DateTime(dt_format='iso8601'),
        'return_date': fields.DateTime(dt_format='iso8601'),
    }),
    'num_of_service_pending_for_me': fields.Integer,
    'feedbacks': fields.Nested(review),
}

service_requests_marshal_field = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'service_id': fields.Integer,
    'is_approved': fields.Boolean,
    'is_rejected': fields.Boolean,
    'is_returned': fields.Boolean,
    'is_revoked': fields.Boolean,
    'rejection_reason': fields.String,
    'service': fields.Nested(service_marshal_fields),
    'user': fields.Nested(user),
    'issue_date': fields.DateTime(dt_format='iso8601'),
    'return_date': fields.DateTime(dt_format='iso8601')
}


class Services(Resource):

    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self, service_id):
        return marshal(Service.query.get(service_id), service_marshal_fields)

    def delete(self, service_id):
        try:
            feedbacks = Feedback.query.filter_by(service_id=service_id).delete()
            requests = ServiceRequest.query.filter_by(service_id=service_id).delete()
            edit_section = Service.query.filter_by(service_id=service_id).delete()
        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Deleting " + e}, 500
        else:
            db.session.commit()
            return {"message": "Deleted successfully"}, 200

    @auth_required("token")
    def put(self, service_id):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('expert', location="form", help="Expert name", required=True)
            parser.add_argument('title', help="Service title", required=True, location="form")
            parser.add_argument('discription', help="Service discription", required=True, location="form")
            parser.add_argument('section', help="Section", required=True, location="form")
            parser.add_argument('prologue', help="Prologue", required=True, location="form")
            # parser.add_argument('image', type=FileStorage, help="Image", location="form")
            args = parser.parse_args(request)

            service = Service.query.get(service_id)

            if 'image' in request.files:
                file = request.files['image']
                if file:
                    filename = str(random.randint(100, 9999999)) + secure_filename(file.filename)

                    file.save("static/uploaded/" + filename)
                    file.close()

                else:
                    filename = service.image
            else:
                filename = service.image

            if args.get('title') == "":
                return {"message": "Title is required"}, 401
            if args.get('expert') == "":
                return {"message": "Expert is required"}, 401
            if args.get('discription') == "":
                return {"message": "discription is required"}, 401
            if args.get('section') == "":
                return {"message": "section is required"}, 401

            service.expert = args.get('expert')
            service.title = args.get('title')
            service.discription = args.get('discription')
            service.prologue = args.get('prologue')
            service.section_id = args.get('section')
            service.image = filename

        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Deleting"}, 500
        else:
            db.session.commit()
            return {"message": "Updated Successfully"}, 200


class ServicesList(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        log_user_visits()
        return marshal(Service.query.order_by(text("service_id desc")).all(), service_marshal_fields)

    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('expert', location="form", help="Expert name", required=True)
        parser.add_argument('title', help="Service title", required=True, location="form")
        parser.add_argument('discription', help="Service discription", required=True, location="form")
        parser.add_argument('section', help="Section", required=True, location="form")
        parser.add_argument('prologue', help="Prologue", required=True, location="form")
        args = parser.parse_args()
        if args.get('title') == "":
            return {"message": "Title is required"}, 401
        if args.get('expert') == "":
            return {"message": "Expert Name is required"}, 401
        if args.get('discription') == "":
            return {"message": "discription is required"}, 401
        if args.get('section') == "":
            return {"message": "section is required"}, 401
        if 'image' in request.files:
            file = request.files['image']
            if file:
                filename = str(random.randint(100000, 100000000)) + secure_filename(file.filename)

                file.save("static/uploaded/" + filename)
                file.close()

            else:
                filename = ""
        else:
            filename = ""
        new_service = Service(expert=args.get('expert'),
                        title=args.get('title'),
                        discription=args.get('discription'),
                        prologue=args.get('prologue'),
                        section_id=args.get('section'),
                        image=filename)

        db.session.add(new_service)
        db.session.commit()
        return marshal(new_service, service_marshal_fields), 201


class SectionList(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        return marshal(Section.query.all(), section_marshal_fields)

    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('section_name', help="Section name", required=True)
        parser.add_argument('section_discription', help="Section Discription", required=True)
        args = parser.parse_args()
        if args.get('section_name') == "":
            return {"message": "Section Name is required"}, 401
        new_section = Section(section_name=args.get('section_name'),
                              section_icon="",
                              section_discription=args.get('section_discription'),
                              date_created=datetime.today())
        db.session.add(new_section)
        db.session.commit()
        return {"message": "Created"}, 201


class SectionL(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self, section_id):
        return marshal(Section.query.get(section_id), section_marshal_fields)

    @auth_required("token")
    @roles_required("admin")
    def put(self, section_id):
        try:
            parser = reqparse.RequestParser()
            parser.add_argument('section_name', help="Section name", required=True)
            parser.add_argument('section_discription', help="Section Discription", required=True)
            args = parser.parse_args()
            if args.get('section_name') == "":
                return {"message": "Section Name is required"}, 401
            edit_section = Section.query.get(section_id)
            edit_section.section_name = args.get('section_name')
            edit_section.section_discription = args.get('section_discription')
        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Updating"}, 500
        else:
            db.session.commit()
            return {"message": "Updated successfully"}, 200

    @roles_required("admin")
    def delete(self, section_id):
        try:
            edit_section = Section.query.get(section_id)
            db.session.delete(edit_section)
        except Exception as e:
            db.session.rollback()
            return {"message": "An Error in Caching"}, 500
        else:
            db.session.commit()
            return {"message": "Deleted successfully"}, 200


class RequestServices(Resource):
    @auth_required("token")
    def get(self, service_id):
        parser = reqparse.RequestParser()
        parser.add_argument('service_id', help="Service ID", required=True)

        req = ServiceRequest(user_id=current_user.id, service_id=service_id)
        db.session.add(req)
        db.session.commit()


class ServiceRequests(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        pending = marshal(ServiceRequest.query.filter_by(is_approved=False, is_rejected=False).all(),
                          service_requests_marshal_field)
        approved = marshal(ServiceRequest.query.filter_by(is_approved=True, is_returned=True).all(),
                           service_requests_marshal_field)

        return jsonify({"pending": pending, "approved": approved})


class ApproveService(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = ServiceRequest.query.get(request_id)
        req.is_approved = True
        req.issue_date = datetime.today()
        db.session.add(req)
        db.session.commit()

        return {"message": "Approved"}, 201


class ReturnService(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = ServiceRequest.query.get(request_id)
        req.is_returned = True
        req.return_date = datetime.today()
        db.session.add(req)
        db.session.commit()

        return {"message": "Returned Service"}, 201


class RejectService(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = ServiceRequest.query.get(request_id)
        req.is_rejected = True
        db.session.add(req)
        db.session.commit()

        return {"message": "Rejected Service"}, 201


class RevokeService(Resource):
    @auth_required("token")
    def get(self, request_id):
        req = ServiceRequest.query.get(request_id)
        req.is_revoked = True
        db.session.add(req)
        db.session.commit()

        return {"message": "Revoked Service"}, 201


class ReviewService(Resource):
    @auth_required("token")
    def post(self, service_id):
        parser = reqparse.RequestParser()
        parser.add_argument('review', help="Review is required", required=True)
        args = parser.parse_args()

        rev = Feedback(service_id=service_id, user_id=current_user.id, feedback=args.get('review'))
        db.session.add(rev)
        db.session.commit()

        return {"message": "Review Added"}, 201


class Search(Resource):
    @auth_required("token")
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('search', help="Search Key", required=True)
        args = parser.parse_args()
        search_value = args.get('search')
        search = "%{}%".format(search_value)

        sections = Section.query.filter(Section.section_name.like(search)).all()
        services = Service.query.filter(Service.title.like(search) | Service.author.like(search)).all()
        return {"sections": marshal(sections, section_marshal_fields), "services": marshal(services, service_marshal_fields)}


class AdminReport(Resource):
    # @cache.cached(timeout=50)
    # @auth_required("token")
    def get(self):
        services = Service.query.all()
        sections = Section.query.all()

        # Create Matplotlib graph
        section_counts = {}
        issued_counts = {}
        for service in services:
            section_name = service.section.section_name
            section_counts[section_name] = section_counts.get(section_name, 0) + 1

            issued_requests = ServiceRequest.query.filter_by(service_id=service.service_id, is_approved=True, is_rejected=False,
                                                          is_returned=False,
                                                          is_revoked=False).all()
            # Count the number of issued requests
            issued_count = len(issued_requests)
            # Store the issued count for the book
            issued_counts[service.title] = issued_count
        # plt.figure(figsize=(5, 5))
        plt.bar(section_counts.keys(), section_counts.values(), color='green')
        plt.xlabel('Section')
        plt.ylabel('Number of Services')
        plt.title('Service Distribution by Section')
        plt.xticks(rotation=90)
        # Convert plot to base64 for embedding in JSON
        buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        plot_data_section = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        # plt.figure(figsize=(5, 5))

        plt.bar(issued_counts.keys(), issued_counts.values())
        plt.xlabel('Services')
        plt.ylabel('Number of Issued Requests')
        plt.title('Number of Issued Requests for Each Service')
        plt.xticks(rotation=90)
        # Convert plot to base64 for embedding in JSON
        buffer = BytesIO()
        plt.tight_layout()
        plt.savefig(buffer, format='png')

        buffer.seek(0)
        plot_data_service = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        # Prepare JSON response
        graph_data = {
            'plot_data_section': plot_data_section,
            'plot_data_service': plot_data_service,
            'section_counts': section_counts
        }

        return jsonify(graph_data)


class MyRequests(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('search', help="Search Key", required=True)
        my_requests = ServiceRequest.query.filter_by(user_id=current_user.id).all()
        return marshal(my_requests, service_requests_marshal_field)
    

class MarkFavService(Resource):
    @auth_required("token")
    # @cache.cached(timeout=50)
    def get(self,service_id):
        user = User.query.get(current_user.id)
        user.fav_service = service_id
        db.session.commit()
        return {"message":"updated successfully"},200


api.add_resource(Search, '/search')
api.add_resource(MyRequests, '/my-requests')

api.add_resource(AdminReport, '/admin/report')

api.add_resource(ReviewService, '/review/<int:service_id>')

# Service Request handling
api.add_resource(RevokeService, '/revoke-request/<int:request_id>')
api.add_resource(ApproveService, '/approve-request/<int:request_id>')
api.add_resource(ReturnService, '/return-request/<int:request_id>')
api.add_resource(RejectService, '/reject-request/<int:request_id>')

api.add_resource(RequestServices, '/request-service/<int:service_id>')

api.add_resource(ServiceRequests, '/service-requests')

api.add_resource(SectionList, '/section')
api.add_resource(SectionL, '/section/<int:section_id>')

api.add_resource(ServicesList, '/service')
api.add_resource(Services, '/service/<int:service_id>')


api.add_resource(MarkFavService, '/service/mark_as_fav/<int:service_id>')

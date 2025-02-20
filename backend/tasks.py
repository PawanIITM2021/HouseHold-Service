from datetime import datetime, timedelta

from celery import shared_task
import flask_excel as excel
from .mail_service import send_message
from .models import User, Role, DailyVisit, ServiceRequest, db
from jinja2 import Template
from celery.utils.log import get_task_logger

from .user_reports import generate_reports

logger = get_task_logger(__name__)


# @shared_task(ignore_result=False)
# def create_resource_csv():
#     stud_res = StudyResource.query.with_entities(
#         StudyResource.topic, StudyResource.description).all()
#
#     csv_output = excel.make_response_from_query_sets(
#         stud_res, ["topic", "description"], "csv")
#     filename = "test.csv"
#
#     with open(filename, 'wb') as f:
#         f.write(csv_output.data)
#
#     return filename


@shared_task(ignore_result=True)
def daily_reminder():
    users = User.query.filter(User.roles.any(Role.name == 'member')).all()
    for user in users:
        daily_visit = DailyVisit.query.filter_by(user_id=user.id, date=datetime.today().strftime('%Y-%m-%d')).count()
        if daily_visit == 0:
            with open('daily_reminder.html', 'r') as f:
                template = Template(f.read())
                send_message(user.email, "HouseHold Service | Don't miss the daily streak - visit the app",
                             template.render(name=user.name))
        else:
            continue
    return "OK"



@shared_task(ignore_result=True)
def send_monthly_report():
    users = User.query.filter(User.roles.any(Role.name == 'member')).all()
    for user in users:
        (grph1, grph2,read_services) = generate_reports(user.id)
        with open('monthly_report.html', 'r') as f:
            template = Template(f.read())
            send_message(user.email, "HouseHold | Monthly Report",
                         template.render(grph1=grph1, grph2=grph2, name=user.name,read_services=read_services))
    return "OK"





@shared_task(ignore_result=True)
def mark_overdue_requests_as_revoked():

    seven_days_ago = datetime.now() - timedelta(days=7)

    # Query for book requests issued 7 or more days ago, approved but not returned, rejected, or revoked
    overdue_requests = ServiceRequest.query.filter(
        ServiceRequest.issue_date <= seven_days_ago,
        ServiceRequest.is_approved == True,  # Assuming 'is_approved' is a boolean field
        ServiceRequest.is_returned == False,
        ServiceRequest.is_rejected == False,
        ServiceRequest.is_revoked == False
    ).all()

    # Mark the retrieved requests as revoked
    for request in overdue_requests:
        request.is_revoked = True

    # Commit the changes to the database
    db.session.commit()

    return "Revoked access of all non-returned book which has been more 7 days"

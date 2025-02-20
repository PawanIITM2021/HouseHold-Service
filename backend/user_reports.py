import base64
import io
from datetime import datetime, timedelta

from matplotlib import pyplot as plt

from backend.models import ServiceRequest, Section, db, User, Service


def get_services_issued_by_section_last_30_days(user_id):
    thirty_days_ago = datetime.now() - timedelta(days=30)

    issued_services = db.session.query(Section.section_name, db.func.count(Service.service_id)) \
        .join(Service, Section.section_id == Service.section_id) \
        .join(ServiceRequest, Service.service_id == ServiceRequest.service_id) \
        .join(User, User.id == ServiceRequest.user_id) \
        .filter(ServiceRequest.issue_date >= thirty_days_ago, User.id == user_id, ServiceRequest.is_approved == True) \
        .group_by(Section.section_name).all()

    return issued_services


def get_services_issued_vs_returned_last_30_days(user_id):
    thirty_days_ago = datetime.now() - timedelta(days=30)

    issued_vs_returned = db.session.query(ServiceRequest.issue_date,
                                          db.func.count(ServiceRequest.id).label('issued'),
                                          db.func.sum(db.cast(ServiceRequest.is_returned, db.Integer)).label('returned')) \
        .join(User, User.id == ServiceRequest.user_id) \
        .filter(ServiceRequest.issue_date >= thirty_days_ago, User.id == user_id) \
        .group_by(ServiceRequest.issue_date).all()

    return issued_vs_returned


def generate_reports(user_id):
    # Get data for reports
    services_issued_by_section = get_services_issued_by_section_last_30_days(user_id)
    services_issued_vs_returned = get_services_issued_vs_returned_last_30_days(user_id)
    services_read = read_service_in30_days(user_id)
    # Generate graph for books issued by section
    section_names = [item[0] for item in services_issued_by_section]
    services_issued_counts = [item[1] for item in services_issued_by_section]
    plt.figure(figsize=(10, 6))
    plt.bar(section_names, services_issued_counts)
    plt.xlabel('Section')
    plt.ylabel('Number of Services Issued')
    plt.title('Number of Services Issued in Each Section (Last 30 Days)')
    plt.xticks(rotation=45)
    plt.tight_layout()
    issued_by_section_graph = save_plot_to_base64()

    # Generate graph for books issued vs. returned
    dates = [item[0] for item in services_issued_vs_returned]
    issued_counts = [item[1] for item in services_issued_vs_returned]
    returned_counts = [item[2] for item in services_issued_vs_returned]
    plt.figure(figsize=(10, 6))
    plt.plot(dates, issued_counts, marker='o', label='Issued')
    plt.plot(dates, returned_counts, marker='o', label='Returned')
    plt.xlabel('Date')
    plt.ylabel('Number of Services')
    plt.title('Total Number of Services Issued vs. dissolve (Last 30 Days)')
    plt.xticks(rotation=45)
    plt.legend()
    plt.tight_layout()
    issued_vs_returned_graph = save_plot_to_base64()

    # Encode graphs to base64
    return issued_by_section_graph, issued_vs_returned_graph, services_read


def save_plot_to_base64():
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    plt.close()
    return image_base64


def read_service_in30_days(user_id):
    thirty_days_ago = datetime.now() - timedelta(days=30)

    return ServiceRequest.query.filter_by(user_id=user_id, is_approved=True).filter(
        ServiceRequest.issue_date > thirty_days_ago).all()

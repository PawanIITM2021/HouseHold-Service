export default ({
    data: () => ({
        bootstrap_modal: {},
        serviceInfo: {
            section: '',
            requests: []
        },
    }),
    methods: {
        markAsFavorite(service_id){
            fetch('/api/service/mark_as_fav/' + service_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                this.getServiceDetails(service_id)
            })
        },
        viewModal(service) {
            this.serviceInfo = service
            this.getServiceDetails(service.service_id)
            this.bootstrap_modal.show()
        },
        getServiceDetails(service_id) {
            fetch('/api/service/' + service_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                if (res.ok) {
                    this.serviceInfo = await res.json()
                }
            })
        },
        approveService(request_id) {
            fetch('/api/approve-request/' + request_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getServiceDetails(this.serviceInfo.service_id)
                    }
                })
        },
        revokeService(request_id) {
            fetch('/api/revoke-request/' + request_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getServiceDetails(this.serviceInfo.service_id)
                    }
                })
        },
        requestServiceForReading(service_id) {
            fetch(`/api/request-service/${service_id}`, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(async (res) => {
                if (res.ok) {
                    this.getServiceDetails(service_id)
                }
            })
        },
        rejectService(request_id) {
            fetch('/api/reject-request/' + request_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getServiceDetails(request_id)
                    }
                })
        }
    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('viewServiceDetailsModal'));
    },
    computed: {
        role() {
            return localStorage.getItem('role')
        },
        imagePath: function () {
            if (this.serviceInfo.hasOwnProperty('image')) {
                if (this.serviceInfo.image == "") {
                    return "static/img/wall-paint.jpg";
                } else {
                    return "static/uploaded/" + this.serviceInfo.image;
                }
            } else {
                return ''
            }
        }

    },
    template: `
        <!-- Modal -->
<div>
    <div class="modal fade" id="viewServiceDetailsModal" tabindex="-1" aria-labelledby="viewServiceDetailsModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viewServiceDetailsModalLabel">Service Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-lg-5 text-center mx-auto">
                            <div class="mx-auto">
                                <img class="mx-auto" :alt="serviceInfo.title" style="max-width: 100%; height: 500px"
                                     :src="imagePath"/>
                            </div>
                        </div>

                        <div class="col-lg-7">
                        <div class="clearfix">
                            <div class="float-start">
                                 <h2>
                                    {{ serviceInfo.title }}
                                </h2>
                            </div>
                            <div class="float-end"  v-if="role=='admin'">
                                <router-link class="text-white" :to="'/edit-service/'+serviceInfo.service_id">
                                    <button class="btn btn-primary" data-bs-dismiss="modal" >
                                        Edit
                                    </button>
                                </router-link>
                                <router-link class="text-white" :to="'/read/'+serviceInfo.service_id">
                                    <button class="btn btn-warning" data-bs-dismiss="modal" >
                                        View/Manage service
                                    </button>
                                </router-link>
                            </div>
                        </div>
                           
                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="home-tab" data-bs-toggle="tab"
                                            data-bs-target="#home" type="button" role="tab" aria-controls="home"
                                            aria-selected="true">About Service
                                    </button>
                                </li>
                                <li class="nav-item" role="presentation"  v-if="role=='admin'">
                                    <button class="nav-link" id="profile-tab" data-bs-toggle="tab"
                                            data-bs-target="#profile" type="button" role="tab" aria-controls="profile"
                                            aria-selected="false">Issued to
                                    </button>
                                </li>
                            </ul>
                            <div class="tab-content mt-2" id="myTabContent">
                                <div class="tab-pane fade show active"  id="home" role="tabpanel"
                                     aria-labelledby="home-tab">
                                    <div class="fs-regular">
                                        <p class="mb-0">Expert
                                         : {{ serviceInfo.expert
                                         }} </p>
                                        <span class="badge bg-secondary">Section : {{ serviceInfo.section.section_name }} </span>
                                        <p class="mb-0 mt-4">Prologue :</p>
                                        <p class="fs-regular"> {{ serviceInfo.prologue }} </p>
                                    </div>
                                    <template  v-if="role!='admin'">
                                        <button v-if="serviceInfo.is_approved_for_me" data-bs-dismiss="modal"
                                                class="btn btn-primary text-white" style="text-decoration: none">
                                            <router-link class="text-white" :to="'read/'+serviceInfo.service_id">
                                                Read
                                            </router-link>
                                        </button>
    
                                        <button v-if="serviceInfo.is_pending_for_me" type="button" class="btn btn-danger"
                                                disabled>
                                            <template>Approval Pending For this service</template>
                                        </button>
    
                                        <template v-if="serviceInfo.num_of_service_pending_for_me >5">
                                                <div class="alert alert-danger">You can only request/read maximum of 5 services at a time. So, you need return current approved service or need to wait till service till approved</div>
                                        </template>
                  
                                                 <button v-if="!serviceInfo.is_pending_for_me && !serviceInfo.is_approved_for_me"
                                                 :disabled="serviceInfo.num_of_service_pending_for_me >5"
                                                        type="button" class="btn btn-primary"
                                                        @click="requestServiceForReading(serviceInfo.service_id)">
                                                    Request This Service
                                                </button>              
                                   
  
                                    </template>
                                    
                                </div>
                                <div class="tab-pane fade" v-if="role=='admin'" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                                    <table class="table table-bordered">
                                        <thead>
                                        <tr>
                                            <th>User Name</th>
                                            <th>Issued at</th>
                                            <th>Status</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="request,i in serviceInfo.requests" :key="i" v-if="!request.is_approved && !request.is_rejected">
                                            <td>{{request.user.name}}</td>
                                            <td>Pending</td>
                                            <td>
                                                <button class="btn btn-sm btn-success" @click="approveService(request.id)">Approve</button>
                                                <button class="btn btn-sm btn-danger" @click="rejectService(request.id)">Reject</button>
                                            </td>
                                        </tr>
                                        
                                        <tr v-for="request,i in serviceInfo.requests" :key="i" v-if="request.is_approved && !request.is_rejected && !request.is_returned && !request.is_revoked">
                                            <td>{{request.user.name}}</td>
                                            <td>{{request.issue_date}}</td>
                                            <td>
                                                <button class="btn btn-sm btn-success" @click="revokeService(request.id)">Revoke Access</button>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" @click="markAsFavorite(serviceInfo.service_id)">Mark this service as Favorite</button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
</div>
        
    `,

})
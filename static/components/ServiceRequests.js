export default ({
    data: () => ({
        requests: []
    }),
    methods: {
        getPendingApprovals() {

            fetch('/api/service-requests', {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(res => res.json())
                .then((res) => {
                    this.requests = res
                })

        },
        approveService(service_id) {
            fetch('/api/approve-request/' + service_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getPendingApprovals()
                    }
                })
        },
        rejectService(service_id) {
            fetch('/api/reject-request/' + service_id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            })
                .then((res) => {
                    if (res.ok) {
                        this.getPendingApprovals()
                    }
                })
        }
    },
    created() {
        this.getPendingApprovals();
    },
    template: `
    <div class="px-3 mt-4 pb-5">
            <h3>Pending Approvals</h3>
            <table class="table table-bordered table-striped">
                <thead>
                <tr>
                    <th>Service Name</th>
                    <th>User Name</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                    <tr v-for="request,i in requests.pending">
                        <td>{{request.service.title}}</td>
                        <td>{{request.user.name}}</td>
                        <td>
                            <button class="btn btn-sm btn-success" @click="approveService(request.id)">Approve</button>
                            <button class="btn btn-sm btn-danger" @click="rejectService(request.id)">Reject</button>
                        </td>
                    </tr>
                </tbody>
            </table>    
            
    </div>
        
    `
})
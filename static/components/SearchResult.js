import ServiceDetailsModal from "./Partials/ServiceDetailsModal.js";

export default ({
    data: () => ({
        searchResult: {}
    }),
    methods: {
        search() {
            fetch('/api/search', {
                method: 'POST',
                body: JSON.stringify({'search': this.$route.query.search_value}),
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token'),
                    'Content-Type': 'application/json'
                }
            }).then((res) => res.json()).then((data) => {
                this.searchResult = data
            })
        },
        showServiceDetail(service) {

            this.$refs.serviceModal.viewModal(service)
        }
    },
    watch: {
        '$route.params': { // Triggers the watcher immediately when the component is created
            handler(newParams, oldParams) {
                this.search()
            }
        }
    },
    created() {
        this.search()
    },
    components: {ServiceDetailsModal},

    template: `
        <div class="search pt-2 pb-5">
            <h4>Result in Services :</h4>
             <table class="table table-bordered">
                <thead>
                <tr>
                
                    <th>Service Title</th>
                    <th>Service Expert</th>
                    <th>Action</th>
                </tr>    
                </thead> 
                <tbody>
                    <tr v-for="(service,i) in searchResult.services">
                        <td>{{service.title}}</td>
                        <td>{{service.expert}}</td>
                        <td >
                        <button class="btn btn-primary" @click="showServiceDetail(service)">View Service</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <h4>Result in Section :</h4>
            <table class="table table-bordered">
                <thead>
                <tr>
                
                    <th>Section Name</th>
                    <th>Discription</th>
                    <th>Action</th>
                </tr>    
                </thead> 
                <tbody>
                    <tr v-for="(section,i) in searchResult.sections">
                        <td>{{section.section_name}}</td>
                        <td>{{section.section_discription}}</td>
                        <td >
                        <button class="btn btn-primary " >
                        <router-link class="text-white" :to="'/section/'+section.section_id">
                            View Section
                        </router-link>
                        </button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <ServiceDetailsModal ref="serviceModal"/>
            
        </div>
    `,


})
import Service from "./Partials/Service.js";
import ServiceDetailsModal from "./Partials/ServiceDetailsModal.js";

export default ({
    data: () => ({
        view_section: {services:[]}
    }),
    methods: {
        getSectionDetails() {
            fetch('/api/section/' + this.$route.params.id, {
               headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(res => res.json()).then((data) => {
                this.view_section = data
            })
        },
        showServiceDetail(service) {
            service.section = this.view_section
            this.$refs.serviceModal.viewModal(service)
        }
    },
    created() {
        this.getSectionDetails()
    },
    components: {Service, ServiceDetailsModal},
    template: `
        <div class="px-3  pb-5">
            <div class="clearfix mt-3">
                <div class="float-start">
                    <h3>Section : {{view_section.section_name}}</h3>     
                              
                </div>
                <div class="float-end">
                    <p class="my-0">Description : {{view_section.section_discription}}</p>                          
                    <p>Date Created : {{view_section.date_created}}</p>   
                 </div>
            </div>
            <h5 class="mb-0">Service Under this Section: </h5>
            <hr>
            <div class="row">
                <div class="card text-danger border-danger mt-2" v-if="view_section.services.length==0">
                    <div class="card-body">
                        <h5>
                            No Services found in this section
                        </h5>
                    </div>
                </div>
                <div class="col-lg-2 mt-3  " style="border-collapse: collapse;"  v-for="(service,i) in view_section.services" :key="i">
                    <Service 
                        @showDetail="showServiceDetail"
                        :key="i" 
                        :service="service"
                    />            
                </div>       
            </div>
                  
            <ServiceDetailsModal ref="serviceModal"/>
            
            
        </div>
    `
})
import Service from './Partials/Service.js';
import ServiceDetailsModal from "./Partials/ServiceDetailsModal.js";

export default ({
    data: () => ({
        showModal: false,
        seviceList: [],
        sections:[]
    }),
    methods: {
        getAllServices() {
            fetch('/api/service', {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                }
            }).then(res => res.json()).then((data) => {
                this.serviceList = data
            })
        },
        showServiceDetail(service) {
            this.$refs.serviceModal.viewModal(service)
        }
    },
    created() {
        this.getAllServices()
    },
    template: `
    <div class="px-3 mt-3 pb-5">
        <h3>Home</h3>
        <div class="wall--bg" style="background: url('static/img/wallpaper2.jpg') center center; min-height:300px">
            <h1 class="wall--heading ">
            <span class="bg-white">Welcome to<br>
                Household Service
            </span>
            </h1>
        </div>

        <h3 class="mb-0 mt-4">All Latest Services</h3>
       <div class="row  justify-content-left">
        <div class="col-lg-2 mt-3  " style="border-collapse: collapse;"  v-for="(service,i) in serviceList" :key="i">
            <Service 
                @showDetail="showServiceDetail"
                :key="i" 
                :service="service"
            />            
        </div>   
        
        <ServiceDetailsModal ref="serviceModal"/>
    </div>
    </div>
    `,
    components: {Service, ServiceDetailsModal}
})
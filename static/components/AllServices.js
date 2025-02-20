import Service from "./Partials/Service.js";
import ServiceDetailsModal from "./Partials/ServiceDetailsModal.js";


export default ({
    data: () => ({
        loading: false,
        new_service: {
            title: '',
            discription: '',
            expert: '',
            image: '',
            section: '',
            prologue: ''
        },
        serviceList: [],
        sections: [],
        bootstrap_modal: {}
    }),
    methods: {
        getAllSections() {
            fetch('/api/section', {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
            }).then(res => res.json()).then((data) => {
                this.sections = data
            })
        },
        addService() {
            this.loading = true;

            const formData = new FormData();
            formData.append("image", this.$refs.serviceImage.files[0]);
            formData.append('title', this.new_service.title);
            formData.append('expert', this.new_service.expert);
            formData.append('discription', this.new_service.discription);
            formData.append('section', this.new_service.section);
            formData.append('prologue', this.new_service.prologue);


            fetch('/api/service', {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'POST',
                body: formData
            }).then(async (res) => {
                if (res.ok) {
                    this.getAllServices()
                    this.bootstrap_modal.hide()
                    this.new_service = {
                        title: '',
                        discription: '',
                        expert: '',
                        image: '',
                        section: ''
                    }
                }else {
                    let data = await res.json()
                    alert(data.message)
                }
            }).finally(() => {
                this.loading = false;
            })
        },
        attachImage() {
            this.service.image = this.$refs.serviceImage.files[0];
        },
        getAllServices() {
            fetch('/api/service', {
                method: 'GET',
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
            }).then(res => res.json()).then((data) => {
                this.serviceList = data
            })
        },
        showServiceDetail(service) {
            this.$refs.serviceModal.viewModal(service)
        }

    },
    mounted() {
        this.bootstrap_modal = new bootstrap.Modal(document.getElementById('addNewServiceModal'));

    },
    created() {
        this.getAllServices()
        this.getAllSections()
    },
    computed: {
        role() {
            return localStorage.getItem('role')
        }
    },
    components: {Service, ServiceDetailsModal},
    template: `
        <div class="pb-5 mt-3">
        
            <!-- Button trigger modal -->


        <div class="px-3  mt-3">
    
        <div class="clearfix">
            <div class="float-start">
                <h2 class="mb-0">All Latest Services</h2>
            </div>
             <div class="float-end">
              <button type="button" v-if="role=='admin'" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#addNewServiceModal">
                    Add New service
              </button>
            </div>
        </div>
      
            <div class="row  justify-content-left">
                <div class="col-lg-2 mt-3  " style="border-collapse: collapse;"  v-for="(service,i) in serviceList" :key="i">
                    <Service 
                      @showDetail="showServiceDetail"
                        :key="i" 
                        :service="service"
                    />            
                </div>   
            </div>
        </div>
        
<!-- Modal -->
         <div class="modal fade" id="addNewServiceModal" tabindex="-1" aria-labelledby="addNewServiceModalLabel" aria-hidden="true">
           <div class="modal-dialog modal-xl">
             <div class="modal-content">
               <div class="modal-header">
                 <h1 class="modal-title fs-5" id="addNewServiceModalLabel">Add New Service</h1>
                 <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
               </div>
               <div class="modal-body">
                 <div class="row">
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Service</label>
                            <input type="text" v-model="new_service.title" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">BASE PRICE</label>
                            <input type="text" v-model="new_service.expert" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Service Cover</label>
                            <input type="file" ref="serviceImage" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Section</label>
                            <select v-model="new_service.section" class="form-select">
                                <option v-for="(section,i) in sections " :key="i" :value="section.section_id">{{section.section_name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Service Prologue</label>
                            <textarea class="form-control" rows="3" maxlength="1000" v-model="new_service.prologue"></textarea>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Service Description</label>
                            <textarea class="form-control" rows="10" maxlength="7000" v-model="new_service.discription"></textarea>
                        </div>
                    </div>
                 </div>
               </div>
               <div class="modal-footer">
                 <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                 <button type="button" class="btn btn-primary" @click="addService" :disabled="loading">
                    <span v-if="loading" class="spinner-grow spinner-grow-sm" aria-hidden="true"></span>
                    ADD Service
                 </button>
               </div>
             </div>
           </div>
         </div>
        
        <ServiceDetailsModal ref="serviceModal"/>
         
        </div>
   `,


});
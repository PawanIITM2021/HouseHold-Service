export default ({
    data: () => ({
        edit_service: {
            title: '',
            discription: '',
            expert: '',
            image: '',
            section_id: '',
            prologue: ''
        },
        sections: []
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
        getServiceDetails() {
            fetch('/api/service/' + this.$route.params.id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'GET',
            }).then(async (res) => {
                if (res.ok) {
                    this.edit_service = await res.json()
                }
            })
        },
        attachImage() {
            this.service.image = this.$refs.serviceImage.files[0];
        },

        editService() {
            this.loading = true;

            const formData = new FormData();
            formData.append("image", this.$refs.serviceImage.files[0]);
            formData.append('title', this.edit_service.title);
            formData.append('expert', this.edit_service.expert);
            formData.append('discription', this.edit_service.discription);
            formData.append('section', this.edit_service.section_id);
            formData.append('prologue', this.edit_service.prologue);


            fetch('/api/service/' + this.$route.params.id, {
                headers: {
                    'Authentication-Token': localStorage.getItem('auth-token')
                },
                method: 'PUT',
                body: formData
            }).then(async (res) => {
                if (res.ok) {
                    this.getServiceDetails()
                    alert("Updated Service Information Successfully")
                    this.edit_service = {
                        title: '',
                        discription: '',
                        expert: '',
                        image: '',
                        section_id: ''
                    }
                }
            }).finally(() => {
                this.loading = false;
            })
        },

    },
    created() {
        this.getServiceDetails()
        this.getAllSections()
    },

    template: `
    <div class="px-5 mt-5 pb-5">
                <h4>Edit Service Info</h4>
                <hr>
                <div class="row">
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Service</label>
                            <input type="text" v-model="edit_service.title" class="form-control">
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Base Price</label>
                            <input type="text" v-model="edit_service.expert" class="form-control">
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
                            <select v-model="edit_service.section_id" class="form-select">
                                <option v-for="(section,i) in sections " :key="i" :value="section.section_id">{{section.section_name}}</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Service Prologue</label>
                            <textarea class="form-control" rows="3" maxlength="1000" v-model="edit_service.prologue"></textarea>
                        </div>
                    </div>
                    <div class="col-lg-6">
                        <div class="form-group">
                            <label class="form-label">Service Discription</label>
                            <textarea class="form-control" rows="10" maxlength="7000" v-model="edit_service.discription"></textarea>
                        </div>
                    </div>
                 </div>
                 <div class="text-end mt-3">
                    <button class="btn btn-primary" @click="editService">Save</button>
</div>
    
    </div>
    `
})
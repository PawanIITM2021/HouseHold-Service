export default ({
    props: {
        service: {
            type: Object,
            default(raw) {
                return {section:'',service_id:'',image:''}
            }
        }
    },
    methods :{
        showDetail(service){
            this.$emit('showDetail',service);
        }
    },
    template: `
        <div class="text-center justify-content-centre pt-3 pb-3 px-2  border border-2 border-secondary">  
            <div    class="mx-auto border border-2 border-secondary" 
                    :style='imagePath'
                    >
            </div> 
            <h6 class="mt-2 mb-0 fs-regular fw-bold" style="white-space: break-spaces; min-height: 40px">{{service.title}}</h6>
            <p class="text-muted fst-italic mb-0">{{service.expert}}</p>
            <button class="btn btn-sm btn-warning mt-2" @click="showDetail(service)">View Details</button>
        </div>
    `,
    computed: {
        imagePath: function () {
            if (this.service.hasOwnProperty('image')) {
                if (this.service.image == "") {
                    return "height: 220px;width: 150px;background:url('static/img/wall-paint.jpg') center;background-size:cover;";
                } else {
                    return "height: 220px;width: 150px;background:url('static/uploaded/" + this.service.image + "') center;background-size:cover;";
                }
            } else {
                return ''
            }
        }
    }
})

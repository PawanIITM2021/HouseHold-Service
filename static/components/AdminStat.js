export default ({
    template: `
     <template>
      <div class="mt-3">
        <div class="row">
            <div class="col-lg-6" ref="plotContainerService">
                <h5>Service Issued</h5>
            </div>
            <div class="col-lg-6" ref="plotContainerSection">
                <h5>Total Sections</h5>
            </div>
        </div>
        <ul>
          <li v-for="(count, section) in sectionCounts" :key="section">
            {{ section }}: {{ count }}
          </li>
        </ul>
      </div>
    </template>
    `,
    data() {
        return {
            plotDataSection: null,
            plotDataService: null,
            sectionCounts: {}
        };
    },
    mounted() {
        this.fetchGraphData();
    },
    methods: {
        fetchGraphData() {
            fetch('/api/admin/report')
                .then(response => response.json())
                .then(data => {
                    this.plotDataSection = data.plot_data_section;
                    this.plotDataService = data.plot_data_service;
                    this.sectionCounts = data.section_counts;
                    this.renderGraph();
                })
                .catch(error => {
                    console.error('Error fetching graph data:', error);
                });
        },
        renderGraph() {
            // Decode base64 image data and render it
            const img = new Image();
            img.style.width ='100%'
            img.src = 'data:image/png;base64,' + this.plotDataService;
            this.$refs.plotContainerService.appendChild(img);


            const img2 = new Image();
            img2.style.width ='100%'
            img2.src = 'data:image/png;base64,' + this.plotDataSection;
            this.$refs.plotContainerSection.appendChild(img2);
        }
    },

})
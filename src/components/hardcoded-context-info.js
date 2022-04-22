export default {
  77: {
    "description": "This dataset contains single cell scale anatomical map of the rat intrinsic cardiac nervous system (ICNS) across four male and three female hearts. These cell clusters can be seen by the yellow data points on the image as well as spherical markers on the 3D heart scaffold. The dataset provides an integrative framework to visualise the spatial distribution of ICNS across different hearts.",
    "heading": "Mapped ICN samples",
    "id": "sparc.science.context_data",
    "samples": [
      {
        "annotation": "",
        "description": "Spatial location of isolated ICNS mapped onto a generic heart scaffold",
        "doi": "",
        "heading": "ICNS from subject M54-8",
        "id": "Sample 1",
        "path": "",
        "view": "View 1",
        "color": "#FFFF00",
        "thumbnail": "https://raw.githubusercontent.com/ABI-Software/map-sidebar/main/assets/temp-pics/orange.png"
      },
      {
        "annotation": "",
        "description": "Spatial location of isolated ICNS mapped onto a generic heart scaffold",
        "doi": "",
        "heading": "ICNS from subject M54-5",
        "id": "Sample 2",
        "path": "",
        "view": "View 2",
        "color": "#FFA500",
        "thumbnail": "https://raw.githubusercontent.com/ABI-Software/map-sidebar/main/assets/temp-pics/teal.png"
      }
    ],
    "version": "0.1.0",
  },
  221: {
    "description": "3D digital tracings of the enteric plexus obtained from seven subjects (M11, M16, M162, M163, M164, M168) are mapped randomly on mouse proximal colon. The data depicts individual neural wiring patterns in enteric microcircuits, and revealed both neuron and fiber units wired in a complex organization.",
    "heading": "Digital tracings of enteric plexus",
    "id": "sparc.science.context_data",
    "samples": [
      {
        "annotation": "",
        "description": "Neuronal soma and fibers in a myenteric ganglion in this subject are annotated into the following groups to highlight their interactions:\n\nNeuron1,2,3 Connex: Connections between 3 neurons and cross-ganglionic fibers\n\nNeuron4_Connex: A small neuron contacts fibers passing the ganglion\n\nNeuron5: Multiple projections of a neuron in an myenteric ganglion\n\nNeuron5,3,7 Connex: Connections between 3 neurons, nerve fibers, IGNEx (complex type of intraganglionic nerve endings) and fibers in the circular muscles.\n\nNeuron8,9,10 Connex: Connections of 3 neurons with each other and with long passing fibers. \n\nIntraganglionic Nerve Ending (IGNE): Digital traces of neurites consist of complex intraganglionic nerve endings. The blue fiber has branched terminals, more likely the afferent nerve endings; the violet and cyan terminals also interweave into the fiber nest; the orange, pink and peach fibers and one process of the neuron cross the IGNE to make 1-2 conjunctions. \n",
        "doi": "",
        "heading": "Digital tracing for subject M11",
        "id": "Sample 1",
        "path": "files/derivative/sub-M11/sam-pCm11/digital-traces/pC PHPS XFP M11 20XZ 180425_180713_2_NL_20.xml",
        "view": "View 1"
      },
      {
        "annotation": "",
        "description": "This digital trace demonstrates some types of wiring. A long process of the green neuron terminates in the intraganglionic nerve endings (IGNE) while in contact with a nerve fiber (cyan),  soma of a neuron (peach) and processes of 3 neurons (magenta, yellow and red). Two neurons and one fiber are traced to an IGNE. ",
        "doi": "",
        "heading": "Digital tracing for subject M16",
        "id": "Sample 2",
        "path": "files/derivative/sub-M16/sam-pCm16/digital-traces/pC PHPS XFP M16 20XZ 180425_180524.xml",
        "view": "View 2"
      }
    ],
    "version": "0.1.0",
    "views": [
      {
        "annotation": "--",
        "description": "Digital tracing of neurons for subject M11.",
        "id": "View 1",
        "path": "files/derivative/Scaffolds/M11_view.json",
        "sample": "Sample 1",
        "thumbnail": "https://api.sparc.science/s3-resource/221/2/files/derivative/Scaffolds/M11_thumbnail.jpeg"
      },
      {
        "annotation": "--",
        "description": "Digital tracing of neurons for subject M16.",
        "id": "View 2",
        "path": "files/derivative/Scaffolds/M16_view.json",
        "sample": "Sample 2",
        "thumbnail": "https://api.sparc.science/s3-resource/221/2/files/derivative/Scaffolds/M16_thumbnail.jpeg"
      }
    ]
  }
}
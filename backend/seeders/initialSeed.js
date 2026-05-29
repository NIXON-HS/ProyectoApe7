const bcrypt = require('bcryptjs');
const {
  sequelize,
  Investigador,
  LineaInvestigacion,
  Proyecto,
  Publicacion,
  Usuario,
  ProyectoInvestigador,
  PublicacionInvestigador
} = require('../models/index');

async function runSeed() {
  try {
    console.log('Iniciando sincronización de base de datos...');
    // Sincroniza y recrea las tablas (limpia datos previos)
    await sequelize.sync({ force: true });
    console.log('Tablas recreadas con éxito.');

    // ==========================================
    // 0. SEMILLA DE USUARIOS
    // ==========================================
    console.log('Insertando usuarios semilla...');
    const hashedPassword = await bcrypt.hash('admin123', 8);
    await Usuario.create({
      nombres: 'Administrador REASONS',
      correo: 'admin@reasons.uta.edu.ec',
      password: hashedPassword,
      rol: 'admin'
    });
    
    const hashedUserPassword = await bcrypt.hash('user123', 8);
    await Usuario.create({
      nombres: 'Investigador REASONS',
      correo: 'investigador@reasons.uta.edu.ec',
      password: hashedUserPassword,
      rol: 'investigador'
    });
    console.log('Usuarios administrador e investigador insertados.');

    // ==========================================
    // 1. SEMILLA DE LÍNEAS DE INVESTIGACIÓN
    // ==========================================
    console.log('Insertando líneas de investigación...');
    const lineas = await LineaInvestigacion.bulkCreate([
      {
        nombre: 'Diseño, Materiales, Producción, Identidad, Sostenibilidad y Tecnologías aplicadas',
        descripcion: 'Estudio orientado al desarrollo de nuevos productos, optimización de materiales eco-amigables, diseño sostenible y mejora de procesos productivos tradicionales con tecnologías avanzadas.',
        abreviatura: 'DMP-IST'
      },
      {
        nombre: 'Software, Tecnologías de la Información y Ciencias de Datos',
        descripcion: 'Investigación en el desarrollo de sistemas de software, integración de tecnologías disruptivas como IoT y Blockchain, analítica predictiva, computación en la nube y machine learning aplicado.',
        abreviatura: 'ST-ICD'
      },
      {
        nombre: 'Energía, Desarrollo Sostenible y Gestión de Recursos Naturales',
        descripcion: 'Optimización de recursos energéticos, evaluación de energías renovables (solar, eólica, biomasa) y modelado sustentable de recursos naturales para minimizar el impacto industrial.',
        abreviatura: 'ED-SGRN'
      }
    ]);
    console.log('Líneas de investigación insertadas.');

    // ==========================================
    // 2. SEMILLA DE INVESTIGADORES
    // ==========================================
    console.log('Insertando investigadores...');
    const investigadores = await Investigador.bulkCreate([
      {
        nombres: 'Israel Naranjo Chiriboga',
        orcid: '0000-0002-8356-9122',
        correo_institucional: 'admin@reasons.uta.edu.ec',
        biografia: 'Ingeniero Industrial y Magíster en Gestión de la Producción. Investigador especializado en optimización de operaciones logísticas, cadena de suministro sostenible y modelado matemático aplicado a sistemas de producción limpia. Lidera el grupo REASONS con un fuerte compromiso por la excelencia académica y tecnológica.',
        posicion: 'Director',
        foto_url: 'assets/images/team/israel-naranjo.jpg',
        red_facebook: 'https://facebook.com/israel.naranjo.uta',
        red_linkedin: 'https://linkedin.com/in/israel-naranjo-chiriboga',
        red_instagram: 'https://instagram.com/israel_naranjo_fisei',
        red_telegram: 'https://t.me/israel_naranjo'
      },
      {
        nombres: 'Franklin Tigre Ortega',
        orcid: '0000-0003-4561-8273',
        correo_institucional: 'franklin.tigre@uta.edu.ec',
        biografia: 'Docente Titular de la FISEI e Investigador en Ingeniería de Procesos. Especialista en la simulación de procesos industriales, evaluación del ciclo de vida (LCA) de productos y estrategias de eco-eficiencia en la manufactura. Subdirector de REASONS, guiando proyectos multidisciplinarios en Tungurahua.',
        posicion: 'Subdirector',
        foto_url: 'assets/images/team/franklin-tigre.jpg',
        red_facebook: 'https://facebook.com/franklin.tigre.uta',
        red_linkedin: 'https://linkedin.com/in/franklin-tigre-ortega',
        red_instagram: 'https://instagram.com/franklin_tigre',
        red_telegram: 'https://t.me/franklin_tigre'
      },
      {
        nombres: 'John Reyes',
        orcid: '0000-0001-9284-7561',
        correo_institucional: 'investigador@reasons.uta.edu.ec',
        biografia: 'Doctor en Informática e Investigador Senior. Apasionado por la inteligencia artificial aplicada a la industria, el desarrollo de arquitecturas de software robustas y escalables y la computación móvil distribuida. Cuenta con más de 15 artículos indexados en Scopus.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/john-reyes.jpg',
        red_linkedin: 'https://linkedin.com/in/john-reyes-fisei'
      },
      {
        nombres: 'Carlos Sánchez',
        orcid: '0000-0002-1100-3344',
        correo_institucional: 'carlos.sanchez@uta.edu.ec',
        biografia: 'Especialista en Ciencia de Datos y Big Data aplicado. Su campo de investigación incluye el diseño de algoritmos de optimización metaheurística para ruteo de vehículos y problemas de secuenciación de producción (scheduling).',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/carlos-sanchez.jpg',
        red_linkedin: 'https://linkedin.com/in/carlos-sanchez-data'
      },
      {
        nombres: 'Luis Morales',
        orcid: '0000-0003-8899-2233',
        correo_institucional: 'luis.morales@uta.edu.ec',
        biografia: 'Ingeniero Químico y Doctor en Energías Renovables. Su trabajo de investigación se centra en la producción de biocombustibles a partir de desechos orgánicos y la descarbonización de la matriz energética en el sector rural ecuatoriano.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/luis-morales.jpg',
        red_linkedin: 'https://linkedin.com/in/luis-morales-energy'
      },
      {
        nombres: 'Freddy Lema',
        orcid: '0000-0001-7788-5566',
        correo_institucional: 'freddy.lema@uta.edu.ec',
        biografia: 'Investigador especialista en sistemas ciberfísicos, automatización industrial avanzada y robótica colaborativa. Trabaja en la integración de tecnologías de gemelos digitales para la optimización en tiempo real de líneas de montaje.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/freddy-lema.jpg',
        red_linkedin: 'https://linkedin.com/in/freddy-lema-automation'
      },
      {
        nombres: 'Edgar Patricio Córdova',
        orcid: '0000-0002-4466-9900',
        correo_institucional: 'edgar.cordova@uta.edu.ec',
        biografia: 'Investigador de vanguardia en ciencia de materiales y metalurgia. Su línea de trabajo incluye el análisis de aleaciones mecánicas ligeras de alta resistencia para aplicaciones automotrices y el eco-diseño de moldes y matrices.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/edgar-cordova.jpg',
        red_linkedin: 'https://linkedin.com/in/edgar-cordova-materials'
      },
      {
        nombres: 'Christian Mariño',
        orcid: '0000-0002-5566-7788',
        correo_institucional: 'christian.marino@uta.edu.ec',
        biografia: 'Investigador de la FISEI centrado en Redes de Computadoras y Telecomunicaciones. Lidera el desarrollo de redes de sensores inalámbricas (WSN) de bajo consumo para monitoreo ambiental y de agricultura de precisión en la provincia de Tungurahua.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/christian-marino.jpg',
        red_linkedin: 'https://linkedin.com/in/christian-marino-net'
      },
      {
        nombres: 'Ana Pamela Castro',
        orcid: '0000-0003-2211-9988',
        correo_institucional: 'ana.castro@uta.edu.ec',
        biografia: 'Diseñadora Industrial de primer nivel y Magíster en Ecodiseño. Enfocada en la revalorización de residuos de la industria textil para la creación de nuevos materiales compuestos aplicados al diseño urbano y de mobiliario sostenible.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/ana-castro.jpg',
        red_instagram: 'https://instagram.com/ana_castro_design'
      },
      {
        nombres: 'Daysi Ortiz',
        orcid: '0000-0001-6677-4455',
        correo_institucional: 'daysi.ortiz@uta.edu.ec',
        biografia: 'Ingeniera Ambiental con mención en Producción Más Limpia. Sus investigaciones evalúan la huella de carbono de los sistemas logísticos y de manufactura de calzado en Tungurahua, aportando soluciones prácticas de mitigación ambiental.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/daysi-ortiz.jpg',
        red_linkedin: 'https://linkedin.com/in/daysi-ortiz-eco'
      },
      {
        nombres: 'César Rosero',
        orcid: '0000-0002-3344-7711',
        correo_institucional: 'cesar.rosero@uta.edu.ec',
        biografia: 'Investigador experto en Investigación de Operaciones y Simulación Estocástica. Trabaja en modelos matemáticos para la toma de decisiones complejas en sistemas de salud y en el diseño y despliegue de redes logísticas humanitarias ante desastres naturales.',
        posicion: 'Investigador',
        foto_url: 'assets/images/team/cesar-rosero.jpg',
        red_linkedin: 'https://linkedin.com/in/cesar-rosero-ops'
      }
    ]);
    console.log('Investigadores insertados.');

    // ==========================================
    // 3. SEMILLA DE PROYECTOS
    // ==========================================
    console.log('Insertando proyectos...');
    const proyectos = await Proyecto.bulkCreate([
      {
        titulo: 'Optimización de Operaciones de Fabricación Ecológica en el Sector Metalmecánico',
        descripcion: 'Proyecto de investigación enfocado en aplicar técnicas de manufactura esbelta (lean manufacturing) y eco-diseño para optimizar los consumos energéticos y reducir el desperdicio de materiales en las PYMES del sector metalmecánico de Tungurahua.',
        objetivos: '1. Evaluar el estado de eco-eficiencia actual de 15 PYMES industriales.\n2. Diseñar un algoritmo metaheurístico de secuenciación de la producción de bajo impacto energético.\n3. Implementar un piloto en planta que demuestre la reducción del 15% de residuos.',
        resultados: 'Desarrollo de una guía metodológica de manufactura ecológica para PYMES de Tungurahua, publicación de un artículo científico en Journal of Cleaner Production y reducción comprobada de huella de carbono.',
        estado: 'Activo',
        linea_id: lineas[0].id
      },
      {
        titulo: 'Desarrollo de una Plataforma IoT Integrada para el Monitoreo de Recursos Hídricos en Ambato',
        descripcion: 'Despliegue de una red de sensores de bajo consumo basados en LoRaWAN para medir variables físicas y químicas del agua en tiempo real, procesando los datos mediante algoritmos predictivos para alertar sobre contaminaciones accidentales.',
        objetivos: '1. Desarrollar hardware embebido e impermeable de sensorización multi-paramétrica.\n2. Desplegar 5 nodos de medición a lo largo de cuencas críticas.\n3. Crear un panel de visualización predictivo con inteligencia artificial.',
        resultados: 'Hardware embebido funcional de bajo costo, API funcional para consulta pública del estado del agua, y 2 tesis de grado de ingeniería en sistemas finalizadas con éxito.',
        estado: 'Activo',
        linea_id: lineas[1].id
      },
      {
        titulo: 'Análisis de Impacto Técnico y Ambiental de Parques Solares en la Micro-Red Eléctrica',
        descripcion: 'Estudio de simulación estocástica y modelado de sistemas de potencia para evaluar la estabilidad, calidad de energía y reducción de gases de efecto invernadero mediante la inyección fotovoltaica distribuida en la micro-red de la UTA.',
        objetivos: '1. Simular la micro-red mediante software especializado ante fluctuaciones solares.\n2. Determinar la máxima penetración fotovoltaica sin comprometer la estabilidad del voltaje.\n3. Evaluar el ciclo de vida ambiental de las celdas de silicio policristalino bajo el clima andino.',
        resultados: 'Modelo de simulación estocástica validado, publicación de resultados en IEEE Transactions, y propuesta técnica formal entregada a la empresa eléctrica para futuras implementaciones.',
        estado: 'Finalizado',
        linea_id: lineas[2].id
      }
    ]);
    console.log('Proyectos insertados.');

    // ==========================================
    // 4. SEMILLA DE PUBLICACIONES
    // ==========================================
    console.log('Insertando publicaciones...');
    const publicaciones = await Publicacion.bulkCreate([
      {
        titulo: 'A Framework for Sustainable Operations in Andean Metalworking Industry',
        resumen: 'This paper presents a novel framework for integrating lean production techniques with circular economy principles tailored for micro and small enterprises in the Andean region. Results demonstrate a significant decrease in material waste and electrical consumption through systematic workstation reorganization.',
        cita: 'Naranjo, I., & Tigre, F. (2025). A Framework for Sustainable Operations in Andean Metalworking Industry. Journal of Cleaner Production, 412, 123456. https://doi.org/10.1016/j.jclepro.2025.123456',
        revista_portada_url: 'assets/images/publications/cleaner-production.jpg',
        doi_url: 'https://doi.org/10.1016/j.jclepro.2025.123456',
        linea_id: lineas[0].id
      },
      {
        titulo: 'Predictive Maintenance in Small Hydroelectric Plants using Machine Learning and IoT',
        resumen: 'Small run-of-river hydroelectric plants suffer from unexpected shutdown due to silt wear. This study presents a system using low-cost vibration and temperature IoT sensors, coupled with a Random Forest predictive model, to schedule optimal preventive maintenance operations, achieving 92% anomaly detection accuracy.',
        cita: 'Sánchez, C., Reyes, J., & Mariño, C. (2026). Predictive Maintenance in Small Hydroelectric Plants using Machine Learning and IoT. IEEE Latin America Transactions, 24(1), 45-53. https://doi.org/10.1109/TLA.2026.987654',
        revista_portada_url: 'assets/images/publications/ieee-latam.jpg',
        doi_url: 'https://doi.org/10.1109/TLA.2026.987654',
        linea_id: lineas[1].id
      },
      {
        titulo: 'Eco-design of Consumer Products: A Case Study in Tungurahua Craft Textiles',
        resumen: 'This work explores the viability of co-design and LCA methodologies inside traditional craft associations in Tungurahua. By substituting synthetic dyes and fibers with organic alternatives, environmental impact was reduced by 34% while increasing final product value in eco-conscious markets.',
        cita: 'Castro, A. P., & Ortiz, D. (2025). Eco-design of Consumer Products: A Case Study in Tungurahua Craft Textiles. International Journal of Design, 19(2), 77-91. https://doi.org/10.5555/ijd.2025.777777',
        revista_portada_url: 'assets/images/publications/ij-design.jpg',
        doi_url: 'https://doi.org/10.5555/ijd.2025.777777',
        linea_id: lineas[0].id
      }
    ]);
    console.log('Publicaciones insertadas.');

    // ==========================================
    // 5. ASOCIACIONES N:M (PROYECTOS & INVESTIGADORES)
    // ==========================================
    console.log('Creando relaciones proyecto-investigador...');
    await ProyectoInvestigador.bulkCreate([
      // Proyecto 1 (Metalmecánica)
      { proyecto_id: proyectos[0].id, investigador_id: investigadores[0].id, rol_proyecto: 'Investigador Principal (Líder)' },
      { proyecto_id: proyectos[0].id, investigador_id: investigadores[1].id, rol_proyecto: 'Co-Investigador' },
      { proyecto_id: proyectos[0].id, investigador_id: investigadores[6].id, rol_proyecto: 'Especialista de Materiales' },
      { proyecto_id: proyectos[0].id, investigador_id: investigadores[9].id, rol_proyecto: 'Asesora de Huella de Carbono' },
      
      // Proyecto 2 (IoT Agua)
      { proyecto_id: proyectos[1].id, investigador_id: investigadores[3].id, rol_proyecto: 'Líder del Área de Ciencia de Datos' },
      { proyecto_id: proyectos[1].id, investigador_id: investigadores[7].id, rol_proyecto: 'Investigador Principal (Hardware IoT)' },
      { proyecto_id: proyectos[1].id, investigador_id: investigadores[2].id, rol_proyecto: 'Co-Investigador (Arquitectura Software)' },
      
      // Proyecto 3 (Solar Micro-red)
      { proyecto_id: proyectos[2].id, investigador_id: investigadores[4].id, rol_proyecto: 'Investigador Principal (Energía)' },
      { proyecto_id: proyectos[2].id, investigador_id: investigadores[5].id, rol_proyecto: 'Co-Investigador (Automatización)' },
      { proyecto_id: proyectos[2].id, investigador_id: investigadores[10].id, rol_proyecto: 'Simulador de Operaciones' }
    ]);
    console.log('Relaciones proyecto-investigador creadas.');

    // ==========================================
    // 6. ASOCIACIONES N:M (PUBLICACIONES & INVESTIGADORES)
    // ==========================================
    console.log('Creando relaciones publicacion-investigador...');
    await PublicacionInvestigador.bulkCreate([
      // Publicación 1
      { publicacion_id: publicaciones[0].id, investigador_id: investigadores[0].id, rol_publicacion: 'Autor Principal' },
      { publicacion_id: publicaciones[0].id, investigador_id: investigadores[1].id, rol_publicacion: 'Coautor (Evaluador de Procesos)' },

      // Publicación 2
      { publicacion_id: publicaciones[1].id, investigador_id: investigadores[3].id, rol_publicacion: 'Autor Principal (Analítica Machine Learning)' },
      { publicacion_id: publicaciones[1].id, investigador_id: investigadores[2].id, rol_publicacion: 'Coautor (Desarrollo API y Cloud)' },
      { publicacion_id: publicaciones[1].id, investigador_id: investigadores[7].id, rol_publicacion: 'Coautor (Firmware IoT)' },

      // Publicación 3
      { publicacion_id: publicaciones[2].id, investigador_id: investigadores[8].id, rol_publicacion: 'Autor Principal (Diseñadora de Producto)' },
      { publicacion_id: publicaciones[2].id, investigador_id: investigadores[9].id, rol_publicacion: 'Coautor (Evaluadora Ambiental LCA)' }
    ]);
    console.log('Relaciones publicacion-investigador creadas.');

    console.log('🎉 PROCESO DE SEMILLA DE BASE DE DATOS FINALIZADO EXITOSAMENTE 🎉');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al ejecutar el script de precarga (Seeders):', error);
    process.exit(1);
  }
}

runSeed();

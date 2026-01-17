// NOTE: Comments in this file reflect AI-assisted coding directed by Jackson Chambers.
// Translations for the Accessible Triage App — AI-assisted coding directed by Jackson Chambers.
// Add new languages by adding a new key with the language code — AI-assisted coding directed by Jackson Chambers.

export const translations = {
  English: {
    // Header & Navigation
    appTitle: 'Accessible Triage System',
    patientCheckIn: 'Patient Check-In',
    staffDashboard: 'Staff Dashboard',
    skipToContent: 'Skip to main content',
    
    // Accessibility Settings
    accessibilitySettings: 'Accessibility Settings',
    darkMode: '🌙 Dark Mode',
    highContrast: '🔲 High Contrast',
    largerButtons: '🔤 Larger Buttons',
    languages: '🌍 Languages',
    
    // Emergency Check-In Header
    emergencyCheckIn: '🏥 Emergency Check-In',
    completeAllFields: 'Please complete all fields below',
    yourInfo: 'Your Info',
    symptoms: 'Symptoms',
    confirm: 'Confirm',
    
    // Step 1: Your Information
    step1Legend: 'Step 1: Your Information',
    fullName: 'Full Name',
    required: '*',
    enterFullName: 'Enter your full name',
    fullNameTTS: 'Full Name. Please enter your first and last name.',
    speakYourName: 'Speak your name',
    
    emailAddress: 'Email Address',
    emailPlaceholder: 'your.email@example.com',
    emailTTS: "Email Address. Enter your email if you'd like to receive updates about your visit. This is optional.",
    emailOptional: 'Optional - for appointment updates',
    invalidEmail: 'Please enter a valid email address',
    
    healthCardNumber: 'Health Card Number',
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: 'Health Card Number. Format is 4 digits, dash, 3 digits, dash, 3 digits, dash, 2 letters PW or MK. You can speak the numbers or use the camera to scan your card.',
    healthCardHelp: 'Format: 1234-323-123-PW • Say numbers or scan your card',
    speakHealthCard: 'Speak health card number',
    scanHealthCard: 'Use camera to scan your health card',
    
    dateOfBirth: 'Date of Birth',
    dobTTS: 'Date of Birth. This will be automatically filled when you scan your health card, or you can select a date manually.',
    dobTip: '💡 Tip: Scan your health card above to auto-fill this field',
    dobVoiceHint: '💡 Say "January 15, 1990" or "15th of January 1990" or "25 years ago" or type manually',
    ageYearsOld: 'years old',
    
    preferredLanguage: 'Preferred Language',
    languageTTS: 'Preferred Language. Select the language you are most comfortable with.',
    otherLanguage: 'Other',
    needHelpButton: '🙋 Need Help?',
    needHelpAlert: 'Please ask a staff member for assistance.',
    needHelpAriaLabel: 'Get help from staff',
    
    nextStep: 'Next Step →',
    previousStep: '← Previous',
    
    // Step 2: Symptoms
    step2Legend: 'Step 2: What brings you in today?',
    describeSymptoms: 'Describe your symptoms',
    symptomsTTS: "Describe your symptoms. Tell us what's wrong. You can type or tap the microphone to speak. Be as detailed as possible about your pain, how long you've had it, and any other symptoms.",
    symptomsPlaceholder: "Tell us what's wrong... (e.g., 'I have a bad headache and feel dizzy')",
    symptomsTip: '💡 Tip: Tap the microphone to speak instead of typing',
    tapToSpeak: 'Tap to speak your symptoms',
    listenToEntry: 'Listen to your entry',
    readBackLabel: 'Read back what I entered',
    yourSymptoms: 'Your symptoms:',
    
    assessSymptoms: 'Assess My Symptoms',
    assessing: 'Assessing...',
    
    // Triage Levels
    triageAssessment: 'Triage Assessment',
    critical: 'Critical',
    criticalDesc: 'You will be seen immediately',
    emergency: 'Emergency',
    emergencyDesc: 'You will be seen very soon',
    urgent: 'Urgent',
    urgentDesc: 'Wait time: approximately 30 minutes',
    lessUrgent: 'Less Urgent',
    lessUrgentDesc: 'Wait time: approximately 1-2 hours',
    nonUrgent: 'Non-Urgent',
    nonUrgentDesc: 'Wait time: may be several hours',
    
    // Step 3: Confirmation
    step3Legend: 'Step 3: Review & Submit',
    reviewInfo: 'Please review your information:',
    name: 'Name',
    email: 'Email',
    healthCard: 'Health Card',
    dob: 'Date of Birth',
    age: 'Age',
    chiefComplaint: 'Chief Complaint',
    priority: 'Priority',
    
    submitCheckIn: 'Submit Check-In',
    submitting: 'Submitting...',
    
    // Success Message
    youreRegistered: "You're Registered!",
    queuePosition: 'Queue Position',
    haveSeat: 'Please have a seat. We will call your name when it\'s your turn.',
    demoMode: '(Demo Mode)',
    checkInAnother: 'Check In Another Patient',
    
    // Errors
    errorPrefix: '⚠️',
    enterName: 'Please enter your full name',
    enterValidHealthCard: 'Please enter a valid health card number',
    enterDOB: 'Please enter your date of birth',
    enterSymptoms: 'Please describe your symptoms',
    enterValidEmail: 'Please enter a valid email address',
    failedToRegister: 'Failed to register. Please try again or ask for help.',
    usingAutoAssessment: 'Using automatic symptom assessment',
    
    // Scanner
    scanHealthCardTitle: 'Scan Health Card',
    close: 'Close',
  },
  
  Spanish: {
    // Header & Navigation
    appTitle: 'Sistema de Triaje Accesible',
    patientCheckIn: 'Registro de Pacientes',
    staffDashboard: 'Panel del Personal',
    skipToContent: 'Ir al contenido principal',
    
    // Accessibility Settings
    accessibilitySettings: 'Configuración de Accesibilidad',
    darkMode: '🌙 Modo Oscuro',
    highContrast: '🔲 Alto Contraste',
    largerButtons: '🔤 Botones Más Grandes',
    languages: '🌍 Idiomas',
    
    // Emergency Check-In Header
    emergencyCheckIn: '🏥 Registro de Emergencia',
    completeAllFields: 'Por favor complete todos los campos',
    yourInfo: 'Tu Información',
    symptoms: 'Síntomas',
    confirm: 'Confirmar',
    
    // Step 1: Your Information
    step1Legend: 'Paso 1: Tu Información',
    fullName: 'Nombre Completo',
    required: '*',
    enterFullName: 'Ingrese su nombre completo',
    fullNameTTS: 'Nombre Completo. Por favor ingrese su nombre y apellido.',
    speakYourName: 'Diga su nombre',
    
    emailAddress: 'Correo Electrónico',
    emailPlaceholder: 'su.correo@ejemplo.com',
    emailTTS: 'Correo Electrónico. Ingrese su correo si desea recibir actualizaciones sobre su visita. Esto es opcional.',
    emailOptional: 'Opcional - para actualizaciones de cita',
    invalidEmail: 'Por favor ingrese un correo electrónico válido',
    
    healthCardNumber: 'Número de Tarjeta de Salud',
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: 'Número de Tarjeta de Salud. El formato es 4 dígitos, guión, 3 dígitos, guión, 3 dígitos, guión, 2 letras PW o MK. Puede decir los números o usar la cámara.',
    healthCardHelp: 'Formato: 1234-323-123-PW • Diga números o escanee su tarjeta',
    speakHealthCard: 'Diga número de tarjeta de salud',
    scanHealthCard: 'Usar cámara para escanear tarjeta',
    
    dateOfBirth: 'Fecha de Nacimiento',
    dobTTS: 'Fecha de Nacimiento. Se completará automáticamente al escanear su tarjeta, o puede seleccionar manualmente.',
    dobTip: '💡 Consejo: Escanee su tarjeta arriba para auto-completar',
    dobVoiceHint: '💡 Diga "15 de enero de 1990" o "15 de enero de 1990" o "hace 25 años" o escríbalo manualmente',
    ageYearsOld: 'años',
    
    preferredLanguage: 'Idioma Preferido',
    languageTTS: 'Idioma Preferido. Seleccione el idioma con el que se sienta más cómodo.',
    otherLanguage: 'Otro',
    needHelpButton: '🙋 ¿Necesita ayuda?',
    needHelpAlert: 'Por favor, pida ayuda a un miembro del personal.',
    needHelpAriaLabel: 'Obtener ayuda del personal',
    
    nextStep: 'Siguiente →',
    previousStep: '← Anterior',
    
    // Step 2: Symptoms
    step2Legend: 'Paso 2: ¿Qué lo trae hoy?',
    describeSymptoms: 'Describa sus síntomas',
    symptomsTTS: 'Describa sus síntomas. Díganos qué le pasa. Puede escribir o tocar el micrófono para hablar. Sea lo más detallado posible.',
    symptomsPlaceholder: "Díganos qué le pasa... (ej: 'Tengo un fuerte dolor de cabeza y mareos')",
    symptomsTip: '💡 Consejo: Toque el micrófono para hablar en lugar de escribir',
    tapToSpeak: 'Toque para hablar sus síntomas',
    listenToEntry: 'Escuchar su entrada',
    readBackLabel: 'Leer lo que ingresé',
    yourSymptoms: 'Sus síntomas:',
    
    assessSymptoms: 'Evaluar Mis Síntomas',
    assessing: 'Evaluando...',
    
    // Triage Levels
    triageAssessment: 'Evaluación de Triaje',
    critical: 'Crítico',
    criticalDesc: 'Será atendido inmediatamente',
    emergency: 'Emergencia',
    emergencyDesc: 'Será atendido muy pronto',
    urgent: 'Urgente',
    urgentDesc: 'Tiempo de espera: aproximadamente 30 minutos',
    lessUrgent: 'Menos Urgente',
    lessUrgentDesc: 'Tiempo de espera: aproximadamente 1-2 horas',
    nonUrgent: 'No Urgente',
    nonUrgentDesc: 'Tiempo de espera: puede ser varias horas',
    
    // Step 3: Confirmation
    step3Legend: 'Paso 3: Revisar y Enviar',
    reviewInfo: 'Por favor revise su información:',
    name: 'Nombre',
    email: 'Correo',
    healthCard: 'Tarjeta de Salud',
    dob: 'Fecha de Nacimiento',
    age: 'Edad',
    chiefComplaint: 'Queja Principal',
    priority: 'Prioridad',
    
    submitCheckIn: 'Enviar Registro',
    submitting: 'Enviando...',
    
    // Success Message
    youreRegistered: '¡Está Registrado!',
    queuePosition: 'Posición en Cola',
    haveSeat: 'Por favor tome asiento. Le llamaremos cuando sea su turno.',
    demoMode: '(Modo Demo)',
    checkInAnother: 'Registrar Otro Paciente',
    
    // Errors
    errorPrefix: '⚠️',
    enterName: 'Por favor ingrese su nombre completo',
    enterValidHealthCard: 'Por favor ingrese un número de tarjeta válido',
    enterDOB: 'Por favor ingrese su fecha de nacimiento',
    enterSymptoms: 'Por favor describa sus síntomas',
    enterValidEmail: 'Por favor ingrese un correo electrónico válido',
    failedToRegister: 'Error al registrar. Por favor intente de nuevo.',
    usingAutoAssessment: 'Usando evaluación automática de síntomas',
    
    // Scanner
    scanHealthCardTitle: 'Escanear Tarjeta de Salud',
    close: 'Cerrar',
  },
  
  French: {
    // Header & Navigation
    appTitle: 'Système de Triage Accessible',
    patientCheckIn: 'Enregistrement Patient',
    staffDashboard: 'Tableau de Bord',
    skipToContent: 'Aller au contenu principal',
    
    // Accessibility Settings
    accessibilitySettings: "Paramètres d'Accessibilité",
    darkMode: '🌙 Mode Sombre',
    highContrast: '🔲 Contraste Élevé',
    largerButtons: '🔤 Grands Boutons',
    languages: '🌍 Langues',
    
    // Emergency Check-In Header
    emergencyCheckIn: "🏥 Enregistrement d'Urgence",
    completeAllFields: 'Veuillez remplir tous les champs',
    yourInfo: 'Vos Informations',
    symptoms: 'Symptômes',
    confirm: 'Confirmer',
    
    // Step 1: Your Information
    step1Legend: 'Étape 1: Vos Informations',
    fullName: 'Nom Complet',
    required: '*',
    enterFullName: 'Entrez votre nom complet',
    fullNameTTS: 'Nom Complet. Veuillez entrer votre prénom et nom de famille.',
    speakYourName: 'Dites votre nom',
    
    emailAddress: 'Adresse Courriel',
    emailPlaceholder: 'votre.courriel@exemple.com',
    emailTTS: "Adresse Courriel. Entrez votre courriel si vous souhaitez recevoir des mises à jour. C'est facultatif.",
    emailOptional: 'Facultatif - pour mises à jour',
    invalidEmail: 'Veuillez entrer une adresse courriel valide',
    
    healthCardNumber: 'Numéro de Carte Santé',
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: "Numéro de Carte Santé. Format: 4 chiffres, tiret, 3 chiffres, tiret, 3 chiffres, tiret, 2 lettres PW ou MK. Vous pouvez parler ou scanner.",
    healthCardHelp: 'Format: 1234-323-123-PW • Dites ou scannez',
    speakHealthCard: 'Dites le numéro de carte',
    scanHealthCard: 'Scanner avec la caméra',
    
    dateOfBirth: 'Date de Naissance',
    dobTTS: 'Date de Naissance. Rempli automatiquement en scannant votre carte, ou sélectionnez manuellement.',
    dobTip: '💡 Conseil: Scannez votre carte pour remplir automatiquement',
    dobVoiceHint: '💡 Dites « 15 janvier 1990 » ou « 15 janvier 1990 » ou « il y a 25 ans » ou saisissez-le manuellement',
    ageYearsOld: 'ans',
    
    preferredLanguage: 'Langue Préférée',
    languageTTS: 'Langue Préférée. Sélectionnez la langue avec laquelle vous êtes le plus à l\'aise.',
    otherLanguage: 'Autre',
    needHelpButton: '🙋 Besoin d\'aide ?',
    needHelpAlert: 'Veuillez demander de l\'aide à un membre du personnel.',
    needHelpAriaLabel: 'Obtenir de l\'aide du personnel',
    
    nextStep: 'Suivant →',
    previousStep: '← Précédent',
    
    // Step 2: Symptoms
    step2Legend: "Étape 2: Qu'est-ce qui vous amène?",
    describeSymptoms: 'Décrivez vos symptômes',
    symptomsTTS: "Décrivez vos symptômes. Dites-nous ce qui ne va pas. Vous pouvez taper ou appuyer sur le microphone pour parler.",
    symptomsPlaceholder: "Dites-nous ce qui ne va pas... (ex: 'J'ai un mal de tête et des vertiges')",
    symptomsTip: '💡 Conseil: Appuyez sur le microphone pour parler',
    tapToSpeak: 'Appuyez pour parler',
    listenToEntry: 'Écouter votre entrée',
    readBackLabel: 'Lire ce que j\'ai entré',
    yourSymptoms: 'Vos symptômes:',
    
    assessSymptoms: 'Évaluer Mes Symptômes',
    assessing: 'Évaluation...',
    
    // Triage Levels
    triageAssessment: 'Évaluation de Triage',
    critical: 'Critique',
    criticalDesc: 'Vous serez vu immédiatement',
    emergency: 'Urgence',
    emergencyDesc: 'Vous serez vu très bientôt',
    urgent: 'Urgent',
    urgentDesc: "Temps d'attente: environ 30 minutes",
    lessUrgent: 'Moins Urgent',
    lessUrgentDesc: "Temps d'attente: environ 1-2 heures",
    nonUrgent: 'Non Urgent',
    nonUrgentDesc: "Temps d'attente: peut être plusieurs heures",
    
    // Step 3: Confirmation
    step3Legend: 'Étape 3: Réviser et Soumettre',
    reviewInfo: 'Veuillez réviser vos informations:',
    name: 'Nom',
    email: 'Courriel',
    healthCard: 'Carte Santé',
    dob: 'Date de Naissance',
    age: 'Âge',
    chiefComplaint: 'Plainte Principale',
    priority: 'Priorité',
    
    submitCheckIn: "Soumettre l'Enregistrement",
    submitting: 'Soumission...',
    
    // Success Message
    youreRegistered: 'Vous Êtes Enregistré!',
    queuePosition: 'Position dans la File',
    haveSeat: "Veuillez vous asseoir. Nous vous appellerons quand ce sera votre tour.",
    demoMode: '(Mode Démo)',
    checkInAnother: 'Enregistrer Un Autre Patient',
    
    // Errors
    errorPrefix: '⚠️',
    enterName: 'Veuillez entrer votre nom complet',
    enterValidHealthCard: 'Veuillez entrer un numéro de carte valide',
    enterDOB: 'Veuillez entrer votre date de naissance',
    enterSymptoms: 'Veuillez décrire vos symptômes',
    enterValidEmail: 'Veuillez entrer une adresse courriel valide',
    failedToRegister: "Échec de l'enregistrement. Veuillez réessayer.",
    usingAutoAssessment: 'Utilisation de l\'évaluation automatique',
    
    // Scanner
    scanHealthCardTitle: 'Scanner Carte Santé',
    close: 'Fermer',
  },
  
  Mandarin: {
    // Header & Navigation
    appTitle: '无障碍分诊系统',
    patientCheckIn: '患者登记',
    staffDashboard: '工作人员仪表板',
    skipToContent: '跳到主要内容',
    
    // Accessibility Settings
    accessibilitySettings: '无障碍设置',
    darkMode: '🌙 深色模式',
    highContrast: '🔲 高对比度',
    largerButtons: '🔤 大按钮',
    languages: '🌍 语言',
    
    // Emergency Check-In Header
    emergencyCheckIn: '🏥 急诊登记',
    completeAllFields: '请填写以下所有字段',
    yourInfo: '您的信息',
    symptoms: '症状',
    confirm: '确认',
    
    // Step 1: Your Information
    step1Legend: '第1步：您的信息',
    fullName: '全名',
    required: '*',
    enterFullName: '输入您的全名',
    fullNameTTS: '全名。请输入您的名字和姓氏。',
    speakYourName: '说出您的名字',
    
    emailAddress: '电子邮件',
    emailPlaceholder: 'your.email@example.com',
    emailTTS: '电子邮件。如果您想收到关于您就诊的更新，请输入您的电子邮件。这是可选的。',
    emailOptional: '可选 - 用于预约更新',
    invalidEmail: '请输入有效的电子邮件地址',
    
    healthCardNumber: '医保卡号',
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: '医保卡号。格式是4位数字，短横，3位数字，短横，3位数字，短横，2个字母PW或MK。您可以说出数字或用相机扫描。',
    healthCardHelp: '格式：1234-323-123-PW • 说出数字或扫描卡片',
    speakHealthCard: '说出医保卡号',
    scanHealthCard: '用相机扫描医保卡',
    
    dateOfBirth: '出生日期',
    dobTTS: '出生日期。扫描医保卡时会自动填写，或者您可以手动选择。',
    dobTip: '💡 提示：扫描上面的医保卡可自动填写此字段',
    dobVoiceHint: '💡 可以说“1990年1月15日”或“1990年1月15日”或“25年前”，或手动输入',
    ageYearsOld: '岁',
    
    preferredLanguage: '首选语言',
    languageTTS: '首选语言。选择您最舒适的语言。',
    otherLanguage: '其他',
    needHelpButton: '🙋 需要帮助？',
    needHelpAlert: '请向工作人员寻求帮助。',
    needHelpAriaLabel: '向工作人员寻求帮助',
    
    nextStep: '下一步 →',
    previousStep: '← 上一步',
    
    // Step 2: Symptoms
    step2Legend: '第2步：您今天来是为什么？',
    describeSymptoms: '描述您的症状',
    symptomsTTS: '描述您的症状。告诉我们哪里不舒服。您可以打字或点击麦克风说话。请尽可能详细。',
    symptomsPlaceholder: "告诉我们哪里不舒服...（例如：'我头痛很厉害，还头晕'）",
    symptomsTip: '💡 提示：点击麦克风说话而不是打字',
    tapToSpeak: '点击说出您的症状',
    listenToEntry: '听您的输入',
    readBackLabel: '读出我输入的内容',
    yourSymptoms: '您的症状：',
    
    assessSymptoms: '评估我的症状',
    assessing: '评估中...',
    
    // Triage Levels
    triageAssessment: '分诊评估',
    critical: '危急',
    criticalDesc: '您将立即得到诊治',
    emergency: '紧急',
    emergencyDesc: '您很快会得到诊治',
    urgent: '急',
    urgentDesc: '等待时间：约30分钟',
    lessUrgent: '较不紧急',
    lessUrgentDesc: '等待时间：约1-2小时',
    nonUrgent: '非紧急',
    nonUrgentDesc: '等待时间：可能几个小时',
    
    // Step 3: Confirmation
    step3Legend: '第3步：审核并提交',
    reviewInfo: '请审核您的信息：',
    name: '姓名',
    email: '电子邮件',
    healthCard: '医保卡',
    dob: '出生日期',
    age: '年龄',
    chiefComplaint: '主诉',
    priority: '优先级',
    
    submitCheckIn: '提交登记',
    submitting: '提交中...',
    
    // Success Message
    youreRegistered: '您已登记！',
    queuePosition: '排队位置',
    haveSeat: '请坐下。轮到您时我们会叫您的名字。',
    demoMode: '（演示模式）',
    checkInAnother: '登记另一位患者',
    
    // Errors
    errorPrefix: '⚠️',
    enterName: '请输入您的全名',
    enterValidHealthCard: '请输入有效的医保卡号',
    enterDOB: '请输入您的出生日期',
    enterSymptoms: '请描述您的症状',
    enterValidEmail: '请输入有效的电子邮件地址',
    failedToRegister: '登记失败。请重试或寻求帮助。',
    usingAutoAssessment: '使用自动症状评估',
    
    // Scanner
    scanHealthCardTitle: '扫描医保卡',
    close: '关闭',
  },
  
  Arabic: {
    // Header & Navigation
    appTitle: 'نظام الفرز المتاح',
    patientCheckIn: 'تسجيل المريض',
    staffDashboard: 'لوحة الموظفين',
    skipToContent: 'انتقل إلى المحتوى الرئيسي',
    
    // Accessibility Settings
    accessibilitySettings: 'إعدادات إمكانية الوصول',
    darkMode: '🌙 الوضع الداكن',
    highContrast: '🔲 تباين عالي',
    largerButtons: '🔤 أزرار أكبر',
    languages: '🌍 اللغات',
    
    // Emergency Check-In Header
    emergencyCheckIn: '🏥 تسجيل الطوارئ',
    completeAllFields: 'يرجى إكمال جميع الحقول أدناه',
    yourInfo: 'معلوماتك',
    symptoms: 'الأعراض',
    confirm: 'تأكيد',
    
    // Step 1: Your Information
    step1Legend: 'الخطوة 1: معلوماتك',
    fullName: 'الاسم الكامل',
    required: '*',
    enterFullName: 'أدخل اسمك الكامل',
    fullNameTTS: 'الاسم الكامل. يرجى إدخال اسمك الأول واسم العائلة.',
    speakYourName: 'قل اسمك',
    
    emailAddress: 'البريد الإلكتروني',
    emailPlaceholder: 'your.email@example.com',
    emailTTS: 'البريد الإلكتروني. أدخل بريدك الإلكتروني إذا كنت ترغب في تلقي تحديثات حول زيارتك. هذا اختياري.',
    emailOptional: 'اختياري - لتحديثات الموعد',
    invalidEmail: 'يرجى إدخال بريد إلكتروني صالح',
    
    healthCardNumber: 'رقم بطاقة الصحة',
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: 'رقم بطاقة الصحة. التنسيق هو 4 أرقام، شرطة، 3 أرقام، شرطة، 3 أرقام، شرطة، حرفين PW أو MK.',
    healthCardHelp: 'التنسيق: 1234-323-123-PW',
    speakHealthCard: 'قل رقم بطاقة الصحة',
    scanHealthCard: 'استخدم الكاميرا لمسح البطاقة',
    
    dateOfBirth: 'تاريخ الميلاد',
    dobTTS: 'تاريخ الميلاد. سيتم ملؤه تلقائيًا عند مسح بطاقتك، أو يمكنك التحديد يدويًا.',
    dobTip: '💡 نصيحة: امسح بطاقتك أعلاه للملء التلقائي',
    dobVoiceHint: '💡 قل "15 يناير 1990" أو "15 من يناير 1990" أو "منذ 25 سنة" أو اكتب يدويًا',
    ageYearsOld: 'سنة',
    
    preferredLanguage: 'اللغة المفضلة',
    languageTTS: 'اللغة المفضلة. اختر اللغة التي تشعر بالراحة معها.',
    otherLanguage: 'أخرى',
    needHelpButton: '🙋 هل تحتاج إلى مساعدة؟',
    needHelpAlert: 'يرجى طلب المساعدة من أحد الموظفين.',
    needHelpAriaLabel: 'الحصول على مساعدة من الموظفين',
    
    nextStep: 'الخطوة التالية ←',
    previousStep: '→ السابق',
    
    // Step 2: Symptoms
    step2Legend: 'الخطوة 2: ما الذي يجلبك اليوم؟',
    describeSymptoms: 'صف أعراضك',
    symptomsTTS: 'صف أعراضك. أخبرنا ما الخطب. يمكنك الكتابة أو النقر على الميكروفون للتحدث.',
    symptomsPlaceholder: "أخبرنا ما الخطب... (مثال: 'لدي صداع شديد ودوخة')",
    symptomsTip: '💡 نصيحة: انقر على الميكروفون للتحدث بدلاً من الكتابة',
    tapToSpeak: 'انقر للتحدث عن أعراضك',
    listenToEntry: 'استمع إلى إدخالك',
    readBackLabel: 'اقرأ ما أدخلته',
    yourSymptoms: 'أعراضك:',
    
    assessSymptoms: 'تقييم أعراضي',
    assessing: 'جارٍ التقييم...',
    
    // Triage Levels
    triageAssessment: 'تقييم الفرز',
    critical: 'حرج',
    criticalDesc: 'ستتم رؤيتك فورًا',
    emergency: 'طوارئ',
    emergencyDesc: 'ستتم رؤيتك قريبًا جدًا',
    urgent: 'عاجل',
    urgentDesc: 'وقت الانتظار: حوالي 30 دقيقة',
    lessUrgent: 'أقل إلحاحًا',
    lessUrgentDesc: 'وقت الانتظار: حوالي 1-2 ساعة',
    nonUrgent: 'غير عاجل',
    nonUrgentDesc: 'وقت الانتظار: قد يكون عدة ساعات',
    
    // Step 3: Confirmation
    step3Legend: 'الخطوة 3: المراجعة والإرسال',
    reviewInfo: 'يرجى مراجعة معلوماتك:',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    healthCard: 'بطاقة الصحة',
    dob: 'تاريخ الميلاد',
    age: 'العمر',
    chiefComplaint: 'الشكوى الرئيسية',
    priority: 'الأولوية',
    
    submitCheckIn: 'إرسال التسجيل',
    submitting: 'جارٍ الإرسال...',
    
    // Success Message
    youreRegistered: 'تم تسجيلك!',
    queuePosition: 'موقعك في الطابور',
    haveSeat: 'يرجى الجلوس. سننادي اسمك عندما يحين دورك.',
    demoMode: '(وضع تجريبي)',
    checkInAnother: 'تسجيل مريض آخر',
    
    // Errors
    errorPrefix: '⚠️',
    enterName: 'يرجى إدخال اسمك الكامل',
    enterValidHealthCard: 'يرجى إدخال رقم بطاقة صحة صالح',
    enterDOB: 'يرجى إدخال تاريخ ميلادك',
    enterSymptoms: 'يرجى وصف أعراضك',
    enterValidEmail: 'يرجى إدخال بريد إلكتروني صالح',
    failedToRegister: 'فشل التسجيل. يرجى المحاولة مرة أخرى.',
    usingAutoAssessment: 'استخدام التقييم التلقائي للأعراض',
    
    // Scanner
    scanHealthCardTitle: 'مسح بطاقة الصحة',
    close: 'إغلاق',
  },
  
  Hindi: {
    // Header & Navigation
    appTitle: 'सुलभ ट्राइएज सिस्टम',
    patientCheckIn: 'मरीज पंजीकरण',
    staffDashboard: 'स्टाफ डैशबोर्ड',
    skipToContent: 'मुख्य सामग्री पर जाएं',
    
    // Accessibility Settings
    accessibilitySettings: 'एक्सेसिबिलिटी सेटिंग्स',
    darkMode: '🌙 डार्क मोड',
    highContrast: '🔲 हाई कॉन्ट्रास्ट',
    largerButtons: '🔤 बड़े बटन',
    languages: '🌍 भाषाएं',
    
    // Emergency Check-In Header
    emergencyCheckIn: '🏥 आपातकालीन चेक-इन',
    completeAllFields: 'कृपया नीचे सभी फ़ील्ड भरें',
    yourInfo: 'आपकी जानकारी',
    symptoms: 'लक्षण',
    confirm: 'पुष्टि करें',
    
    // Step 1: Your Information
    step1Legend: 'चरण 1: आपकी जानकारी',
    fullName: 'पूरा नाम',
    required: '*',
    enterFullName: 'अपना पूरा नाम दर्ज करें',
    fullNameTTS: 'पूरा नाम। कृपया अपना पहला और अंतिम नाम दर्ज करें।',
    speakYourName: 'अपना नाम बोलें',
    
    emailAddress: 'ईमेल पता',
    emailPlaceholder: 'your.email@example.com',
    emailTTS: 'ईमेल पता। यदि आप अपनी यात्रा के बारे में अपडेट प्राप्त करना चाहते हैं तो अपना ईमेल दर्ज करें। यह वैकल्पिक है।',
    emailOptional: 'वैकल्पिक - अपॉइंटमेंट अपडेट के लिए',
    invalidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें',
    
    healthCardNumber: 'स्वास्थ्य कार्ड नंबर',
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: 'स्वास्थ्य कार्ड नंबर। प्रारूप 4 अंक, डैश, 3 अंक, डैश, 3 अंक, डैश, 2 अक्षर PW या MK है।',
    healthCardHelp: 'प्रारूप: 1234-323-123-PW',
    speakHealthCard: 'स्वास्थ्य कार्ड नंबर बोलें',
    scanHealthCard: 'कार्ड स्कैन करने के लिए कैमरा उपयोग करें',
    
    dateOfBirth: 'जन्म तिथि',
    dobTTS: 'जन्म तिथि। जब आप अपना कार्ड स्कैन करते हैं तो यह स्वचालित रूप से भर जाएगा, या आप मैन्युअल रूप से चुन सकते हैं।',
    dobTip: '💡 टिप: ऑटो-फिल के लिए ऊपर अपना कार्ड स्कैन करें',
    dobVoiceHint: '💡 कहें "15 जनवरी 1990" या "15 जनवरी 1990" या "25 साल पहले" या मैन्युअल रूप से टाइप करें',
    ageYearsOld: 'साल',
    
    preferredLanguage: 'पसंदीदा भाषा',
    languageTTS: 'पसंदीदा भाषा। वह भाषा चुनें जिसमें आप सबसे सहज हैं।',
    otherLanguage: 'अन्य',
    needHelpButton: '🙋 मदद चाहिए?',
    needHelpAlert: 'कृपया किसी स्टाफ सदस्य से सहायता माँगें।',
    needHelpAriaLabel: 'स्टाफ से सहायता प्राप्त करें',
    
    nextStep: 'अगला चरण →',
    previousStep: '← पिछला',
    
    // Step 2: Symptoms
    step2Legend: 'चरण 2: आज आप क्यों आए हैं?',
    describeSymptoms: 'अपने लक्षणों का वर्णन करें',
    symptomsTTS: 'अपने लक्षणों का वर्णन करें। हमें बताएं क्या समस्या है। आप टाइप कर सकते हैं या बोलने के लिए माइक्रोफोन पर टैप कर सकते हैं।',
    symptomsPlaceholder: "हमें बताएं क्या समस्या है... (उदा: 'मुझे तेज सिरदर्द और चक्कर आ रहा है')",
    symptomsTip: '💡 टिप: टाइप करने के बजाय बोलने के लिए माइक्रोफोन पर टैप करें',
    tapToSpeak: 'अपने लक्षण बोलने के लिए टैप करें',
    listenToEntry: 'अपनी एंट्री सुनें',
    readBackLabel: 'मैंने जो लिखा वह पढ़ें',
    yourSymptoms: 'आपके लक्षण:',
    
    assessSymptoms: 'मेरे लक्षणों का आकलन करें',
    assessing: 'आकलन हो रहा है...',
    
    // Triage Levels
    triageAssessment: 'ट्राइएज आकलन',
    critical: 'गंभीर',
    criticalDesc: 'आपको तुरंत देखा जाएगा',
    emergency: 'आपातकालीन',
    emergencyDesc: 'आपको बहुत जल्द देखा जाएगा',
    urgent: 'अत्यावश्यक',
    urgentDesc: 'प्रतीक्षा समय: लगभग 30 मिनट',
    lessUrgent: 'कम अत्यावश्यक',
    lessUrgentDesc: 'प्रतीक्षा समय: लगभग 1-2 घंटे',
    nonUrgent: 'गैर-अत्यावश्यक',
    nonUrgentDesc: 'प्रतीक्षा समय: कई घंटे हो सकते हैं',
    
    // Step 3: Confirmation
    step3Legend: 'चरण 3: समीक्षा और सबमिट करें',
    reviewInfo: 'कृपया अपनी जानकारी की समीक्षा करें:',
    name: 'नाम',
    email: 'ईमेल',
    healthCard: 'स्वास्थ्य कार्ड',
    dob: 'जन्म तिथि',
    age: 'आयु',
    chiefComplaint: 'मुख्य शिकायत',
    priority: 'प्राथमिकता',
    
    submitCheckIn: 'चेक-इन सबमिट करें',
    submitting: 'सबमिट हो रहा है...',
    
    // Success Message
    youreRegistered: 'आप पंजीकृत हैं!',
    queuePosition: 'कतार में स्थिति',
    haveSeat: 'कृपया बैठ जाइए। जब आपकी बारी आएगी तो हम आपका नाम पुकारेंगे।',
    demoMode: '(डेमो मोड)',
    checkInAnother: 'एक और मरीज पंजीकृत करें',
    
    // Errors
    errorPrefix: '⚠️',
    enterName: 'कृपया अपना पूरा नाम दर्ज करें',
    enterValidHealthCard: 'कृपया एक मान्य स्वास्थ्य कार्ड नंबर दर्ज करें',
    enterDOB: 'कृपया अपनी जन्म तिथि दर्ज करें',
    enterSymptoms: 'कृपया अपने लक्षणों का वर्णन करें',
    enterValidEmail: 'कृपया एक मान्य ईमेल पता दर्ज करें',
    failedToRegister: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',
    usingAutoAssessment: 'स्वचालित लक्षण आकलन का उपयोग',
    
    // Scanner
    scanHealthCardTitle: 'स्वास्थ्य कार्ड स्कैन करें',
    close: 'बंद करें',
  },
  
  Portuguese: {
    // Header & Navigation
    appTitle: 'Sistema de Triagem Acessível',
    patientCheckIn: 'Registro de Paciente',
    staffDashboard: 'Painel da Equipe',
    skipToContent: 'Ir para o conteúdo principal',
    
    // Accessibility Settings
    accessibilitySettings: 'Configurações de Acessibilidade',
    darkMode: '🌙 Modo Escuro',
    highContrast: '🔲 Alto Contraste',
    largerButtons: '🔤 Botões Maiores',
    languages: '🌍 Idiomas',
    
    // Emergency Check-In Header
    emergencyCheckIn: '🏥 Registro de Emergência',
    completeAllFields: 'Por favor, preencha todos os campos',
    yourInfo: 'Suas Informações',
    symptoms: 'Sintomas',
    confirm: 'Confirmar',
    
    // Step 1: Your Information
    step1Legend: 'Passo 1: Suas Informações',
    fullName: 'Nome Completo',
    required: '*',
    enterFullName: 'Digite seu nome completo',
    fullNameTTS: 'Nome Completo. Por favor, digite seu primeiro e último nome.',
    speakYourName: 'Fale seu nome',
    
    emailAddress: 'Endereço de Email',
    emailPlaceholder: 'seu.email@exemplo.com',
    emailTTS: 'Endereço de Email. Digite seu email se quiser receber atualizações sobre sua visita. Isso é opcional.',
    emailOptional: 'Opcional - para atualizações',
    invalidEmail: 'Por favor, digite um email válido',
    
    healthCardNumber: 'Número do Cartão de Saúde',
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: 'Número do Cartão de Saúde. O formato é 4 dígitos, traço, 3 dígitos, traço, 3 dígitos, traço, 2 letras PW ou MK.',
    healthCardHelp: 'Formato: 1234-323-123-PW',
    speakHealthCard: 'Fale o número do cartão',
    scanHealthCard: 'Usar câmera para escanear',
    
    dateOfBirth: 'Data de Nascimento',
    dobTTS: 'Data de Nascimento. Será preenchido automaticamente ao escanear seu cartão, ou você pode selecionar manualmente.',
    dobTip: '💡 Dica: Escaneie seu cartão acima para preencher automaticamente',
    dobVoiceHint: '💡 Diga "15 de janeiro de 1990" ou "15 de janeiro de 1990" ou "há 25 anos" ou digite manualmente',
    ageYearsOld: 'anos',
    
    preferredLanguage: 'Idioma Preferido',
    languageTTS: 'Idioma Preferido. Selecione o idioma com o qual você se sente mais confortável.',
    otherLanguage: 'Outro',
    needHelpButton: '🙋 Precisa de ajuda?',
    needHelpAlert: 'Por favor, peça ajuda a um membro da equipe.',
    needHelpAriaLabel: 'Obter ajuda da equipe',
    
    nextStep: 'Próximo →',
    previousStep: '← Anterior',
    
    // Step 2: Symptoms
    step2Legend: 'Passo 2: O que traz você hoje?',
    describeSymptoms: 'Descreva seus sintomas',
    symptomsTTS: 'Descreva seus sintomas. Diga-nos o que está errado. Você pode digitar ou tocar no microfone para falar.',
    symptomsPlaceholder: "Diga-nos o que está errado... (ex: 'Tenho uma forte dor de cabeça e tontura')",
    symptomsTip: '💡 Dica: Toque no microfone para falar em vez de digitar',
    tapToSpeak: 'Toque para falar seus sintomas',
    listenToEntry: 'Ouvir sua entrada',
    readBackLabel: 'Ler o que eu digitei',
    yourSymptoms: 'Seus sintomas:',
    
    assessSymptoms: 'Avaliar Meus Sintomas',
    assessing: 'Avaliando...',
    
    // Triage Levels
    triageAssessment: 'Avaliação de Triagem',
    critical: 'Crítico',
    criticalDesc: 'Você será atendido imediatamente',
    emergency: 'Emergência',
    emergencyDesc: 'Você será atendido muito em breve',
    urgent: 'Urgente',
    urgentDesc: 'Tempo de espera: aproximadamente 30 minutos',
    lessUrgent: 'Menos Urgente',
    lessUrgentDesc: 'Tempo de espera: aproximadamente 1-2 horas',
    nonUrgent: 'Não Urgente',
    nonUrgentDesc: 'Tempo de espera: pode ser várias horas',
    
    // Step 3: Confirmation
    step3Legend: 'Passo 3: Revisar e Enviar',
    reviewInfo: 'Por favor, revise suas informações:',
    name: 'Nome',
    email: 'Email',
    healthCard: 'Cartão de Saúde',
    dob: 'Data de Nascimento',
    age: 'Idade',
    chiefComplaint: 'Queixa Principal',
    priority: 'Prioridade',
    
    submitCheckIn: 'Enviar Registro',
    submitting: 'Enviando...',
    
    // Success Message
    youreRegistered: 'Você Está Registrado!',
    queuePosition: 'Posição na Fila',
    haveSeat: 'Por favor, sente-se. Chamaremos seu nome quando for sua vez.',
    demoMode: '(Modo Demo)',
    checkInAnother: 'Registrar Outro Paciente',
    
    // Errors
    errorPrefix: '⚠️',
    enterName: 'Por favor, digite seu nome completo',
    enterValidHealthCard: 'Por favor, digite um número de cartão válido',
    enterDOB: 'Por favor, digite sua data de nascimento',
    enterSymptoms: 'Por favor, descreva seus sintomas',
    enterValidEmail: 'Por favor, digite um email válido',
    failedToRegister: 'Falha no registro. Por favor, tente novamente.',
    usingAutoAssessment: 'Usando avaliação automática de sintomas',
    
    // Scanner
    scanHealthCardTitle: 'Escanear Cartão de Saúde',
    close: 'Fechar',
  },

  // Mi'kmaw (Mi'kmaq) - Indigenous language of Nova Scotia
  "Mi'kmaw": {
    // Header & Navigation
    appTitle: "Ta'n Tel-Wi'kuom Aqq Triage",
    patientCheckIn: "Wen Wjit Piskwa'tu'kw",
    staffDashboard: "L'nu'k Ankukamkewe'l",
    skipToContent: "Eykik wjit nutqwe'k",
    
    // Accessibility Settings
    accessibilitySettings: "Apoqnmatulti'k Ilsutasikl",
    darkMode: '🌙 Boktukesk',
    highContrast: '🔲 Maw-Kisi-Nemi\'k',
    largerButtons: '🔤 Espi-Pkije\'k',
    languages: "🌍 Klusuaqann",
    
    // Emergency Check-In Header
    emergencyCheckIn: "🏥 Kesatm-Apoqnmasuti Piskwa'tu'kw",
    completeAllFields: "Toqo ta'n koqoey wjit ula",
    yourInfo: "Ki'l Koqoey",
    symptoms: "Ta'n Kisi-Ketu'k",
    confirm: "Keknue'k",
    
    // Step 1: Your Information
    step1Legend: "1: Ki'l Koqoey",
    fullName: "Mawi-Wi'sunn",
    required: '*',
    enterFullName: "Wisu'nn tetapeki",
    fullNameTTS: "Mawi-Wi'sunn. Teli-wisu'nn.",
    speakYourName: "Wisu'nn tela'tekn",
    
    emailAddress: 'Email',
    emailPlaceholder: 'email@example.com',
    emailTTS: "Email wjit ankamkewey.",
    emailOptional: "Mu tliatukw - wjit ankamkewey",
    invalidEmail: "Wela'lioq email tetapeki",
    
    healthCardNumber: "Mntu'k-Ika'taqn Siawa'sik",
    healthCardPlaceholder: '####-###-###-XX',
    healthCardTTS: "Mntu'k-Ika'taqn Siawa'sik. ####-###-###-XX.",
    healthCardHelp: "1234-323-123-PW",
    speakHealthCard: "Siawa'sik tela'tekn",
    scanHealthCard: "Ika'taqn ankaptm",
    
    dateOfBirth: "Ta'n Tlimk Welteskemk",
    dobTTS: "Ta'n Tlimk Welteskemk.",
    dobTip: "💡 Ika'taqn ankaptm wjit ula",
    dobVoiceHint: '💡 Say "January 15, 1990" or "15th of January 1990" or "25 years ago" or type manually',
    ageYearsOld: "tepiknuset",
    
    preferredLanguage: "Klusuaqan Ketu'k",
    languageTTS: "Ta'n klusuaqan weli-ankamuin.",
    otherLanguage: "Ap Koqoey",
    needHelpButton: '🙋 Need Help?',
    needHelpAlert: 'Please ask a staff member for assistance.',
    needHelpAriaLabel: 'Get help from staff',
    
    nextStep: "Ap Ankuk →",
    previousStep: "← Toqwa'q",
    
    // Step 2: Symptoms
    step2Legend: "2: Koqoey Kejitu'n?",
    describeSymptoms: "Ta'n kisi-ketu'k teli-a'tu",
    symptomsTTS: "Ta'n kisi-ketu'k. Tlimulk koqoey maw-wikma'jultimk.",
    symptomsPlaceholder: "Tlimulk koqoey...",
    symptomsTip: "💡 Ketu'k tela'tekn",
    tapToSpeak: "Pisku'k wjit klusuaqan",
    listenToEntry: "Nutk ki'l",
    readBackLabel: "Nutm ta'n tela'tu",
    yourSymptoms: "Ki'l kisi-ketu'k:",
    
    assessSymptoms: "Ankamk Kisi-ketu'k",
    assessing: "Ankamk...",
    
    // Triage Levels
    triageAssessment: "Triage Ankamkewey",
    critical: "Maw-Kesatm",
    criticalDesc: "Nuku ankamulk",
    emergency: "Kesatm",
    emergencyDesc: "Kesikewiku ankamulk",
    urgent: "Pukwelk",
    urgentDesc: "Ankamkewey: 30 tlipunasek",
    lessUrgent: "Mu Eskwaq Pukwelk",
    lessUrgentDesc: "Ankamkewey: 1-2 tlepunasek",
    nonUrgent: "Mu Kesatm",
    nonUrgentDesc: "Ankamkewey: siawi-pukwelk tlepunasek",
    
    // Step 3: Confirmation
    step3Legend: "3: Ankaptm aqq Ika'lk",
    reviewInfo: "Ankaptm koqoey:",
    name: "Wi'sunn",
    email: "Email",
    healthCard: "Mntu'k-Ika'taqn",
    dob: "Welteskemk",
    age: "Tepiknuset",
    chiefComplaint: "Koqoey Kejitu'n",
    priority: "Ta'n Naqtuk",
    
    submitCheckIn: "Ika'lk",
    submitting: "Ika'lk...",
    
    // Success Message
    youreRegistered: "Kisi-Piskwa'tu'kw!",
    queuePosition: "Ki'l Eykik",
    haveSeat: "Api. Na wikulk ta'n tlimk ki'l wikik.",
    demoMode: "(Demo)",
    checkInAnother: "Ap Wen Piskwa'tu'kw",
    
    // Errors
    errorPrefix: '⚠️',
    enterName: "Wisu'nn tetapeki",
    enterValidHealthCard: "Mntu'k-ika'taqn tetapeki",
    enterDOB: "Welteskemk tetapeki",
    enterSymptoms: "Tlimulk koqoey",
    enterValidEmail: "Email tetapeki",
    failedToRegister: "Mu kisi-piskwa'tu'kw. Ap aji'tuin.",
    usingAutoAssessment: "Ankamkewey teli-amalimk",
    
    // Scanner
    scanHealthCardTitle: "Ika'taqn Ankaptm",
    close: "Kespi'tk",
  },
};

// Helper function to get translation — AI-assisted coding directed by Jackson Chambers.
export const getTranslation = (language, key) => {
  const lang = translations[language] || translations.English;
  return lang[key] || translations.English[key] || key;
};

// Helper hook for components — AI-assisted coding directed by Jackson Chambers.
export const useTranslation = (language) => {
  const t = (key) => getTranslation(language, key);
  return { t };
};

// Language display names (for dropdowns) — AI-assisted coding directed by Jackson Chambers.
export const languageDisplayNames = {
  English: 'English',
  Spanish: 'Español',
  French: 'Français',
  "Mi'kmaw": "Mi'kmaw",
  Mandarin: '中文',
  Arabic: 'العربية',
  Hindi: 'हिन्दी',
  Portuguese: 'Português',
};

// Available languages array — AI-assisted coding directed by Jackson Chambers.
export const LANGUAGES = Object.keys(translations);

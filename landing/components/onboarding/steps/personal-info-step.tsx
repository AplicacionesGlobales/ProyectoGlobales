"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowRight, Eye, EyeOff, Mail, Lock, User, Building, Phone, FileText,
  Check, ChevronDown, Search, X, Loader2, CheckCircle, XCircle, AtSign
} from "lucide-react"
import { useValidation } from "@/hooks/use-validation"

// Countries data
const countries = [
  { name: "Costa Rica", code: "+506", flag: "🇨🇷", iso: "CR" },
  { name: "Estados Unidos", code: "+1", flag: "🇺🇸", iso: "US" },
  { name: "México", code: "+52", flag: "🇲🇽", iso: "MX" },
  { name: "España", code: "+34", flag: "🇪🇸", iso: "ES" },
  { name: "Argentina", code: "+54", flag: "🇦🇷", iso: "AR" },
  { name: "Colombia", code: "+57", flag: "🇨🇴", iso: "CO" },
  { name: "Perú", code: "+51", flag: "🇵🇪", iso: "PE" },
  { name: "Chile", code: "+56", flag: "🇨🇱", iso: "CL" },
  { name: "Ecuador", code: "+593", flag: "🇪🇨", iso: "EC" },
  { name: "Venezuela", code: "+58", flag: "🇻🇪", iso: "VE" },
  { name: "Guatemala", code: "+502", flag: "🇬🇹", iso: "GT" },
  { name: "El Salvador", code: "+503", flag: "🇸🇻", iso: "SV" },
  { name: "Honduras", code: "+504", flag: "🇭🇳", iso: "HN" },
  { name: "Nicaragua", code: "+505", flag: "🇳🇮", iso: "NI" },
  { name: "Panamá", code: "+507", flag: "🇵🇦", iso: "PA" },
  { name: "República Dominicana", code: "+1809", flag: "🇩🇴", iso: "DO" },
  { name: "Cuba", code: "+53", flag: "🇨🇺", iso: "CU" },
  { name: "Brasil", code: "+55", flag: "🇧🇷", iso: "BR" },
  { name: "Uruguay", code: "+598", flag: "🇺🇾", iso: "UY" },
  { name: "Paraguay", code: "+595", flag: "🇵🇾", iso: "PY" },
  { name: "Bolivia", code: "+591", flag: "🇧🇴", iso: "BO" },
  { name: "Canadá", code: "+1", flag: "🇨🇦", iso: "CA" },
  { name: "Reino Unido", code: "+44", flag: "🇬🇧", iso: "GB" },
  { name: "Francia", code: "+33", flag: "🇫🇷", iso: "FR" },
  { name: "Alemania", code: "+49", flag: "🇩🇪", iso: "DE" },
  { name: "Italia", code: "+39", flag: "🇮🇹", iso: "IT" },
  { name: "Portugal", code: "+351", flag: "🇵🇹", iso: "PT" },
]

// Password strength utilities
const calculatePasswordStrength = (password: string) => {
  let strength = 0
  const checks = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }
  
  Object.values(checks).forEach(check => {
    if (check) strength += 20
  })
  
  return { strength, checks }
}

const getPasswordStrengthColor = (strength: number) => {
  if (strength <= 20) return "#ef4444"
  if (strength <= 40) return "#f97316"
  if (strength <= 60) return "#eab308"
  if (strength <= 80) return "#84cc16"
  return "#22c55e"
}

const getPasswordStrengthText = (strength: number) => {
  if (strength <= 20) return "Muy débil"
  if (strength <= 40) return "Débil"
  if (strength <= 60) return "Regular"
  if (strength <= 80) return "Buena"
  return "Fuerte"
}

// Country Selector Component
const CountrySelector = ({ selectedCountry, onSelect, phoneNumber, onPhoneChange }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.includes(searchQuery)
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-400 focus:border-blue-500 focus:bg-blue-50 transition-all duration-200"
        >
          <span className="text-lg">{selectedCountry.flag}</span>
          <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <div className="flex-1 flex items-center border-2 rounded-xl px-4 bg-white border-gray-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md">
          <Phone className="mr-3 text-gray-400" size={20} />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, ''))}
            placeholder="123 456 7890"
            className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar país..."
                  className="w-full pl-10 pr-10 py-2 bg-gray-50 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.map((country) => (
                <button
                  key={country.iso}
                  onClick={() => {
                    onSelect(country)
                    setIsOpen(false)
                    setSearchQuery("")
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors ${
                    selectedCountry.iso === country.iso ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">{country.name}</div>
                    <div className="text-sm text-gray-500">{country.code}</div>
                  </div>
                  {selectedCountry.iso === country.iso && (
                    <Check className="text-blue-500" size={20} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface PersonalInfoStepProps {
  data: {
    firstName: string
    lastName: string
    email: string
    username: string
    phone: string
    businessName: string
    description: string
    password: string
    confirmPassword: string
  }
  onChange: (data: any) => void
  onNext: () => void
}

export function PersonalInfoStep({ data, onChange, onNext }: PersonalInfoStepProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phoneNumber, setPhoneNumber] = useState("")
  
  // Validation hooks
  const emailValidation = useValidation('email', data.email, { 
    required: true, 
    debounceMs: 500 
  });
  
  const usernameValidation = useValidation('username', data.username, { 
    required: true, 
    minLength: 3, 
    debounceMs: 500 
  });
  
  const passwordStrength = calculatePasswordStrength(data.password)

  // Initialize validation when fields have content
  useEffect(() => {
    if (data.email.trim()) emailValidation.markAsTouched()
    if (data.username.trim()) usernameValidation.markAsTouched()
  }, [])

  // Field validation
  const validateField = (field: string, value: string) => {
    let error = ""
    
    switch (field) {
      case "firstName":
        if (!value.trim()) error = "El nombre es requerido"
        else if (value.length < 2) error = "Debe tener al menos 2 caracteres"
        break
      case "lastName":
        if (!value.trim()) error = "El apellido es requerido"
        else if (value.length < 2) error = "Debe tener al menos 2 caracteres"
        break
      case "phone":
        if (phoneNumber && phoneNumber.length < 8) error = "El teléfono debe tener al menos 8 dígitos"
        break
      case "businessName":
        if (!value.trim()) error = "El nombre del negocio es requerido"
        else if (value.length < 3) error = "Debe tener al menos 3 caracteres"
        break
      case "password":
        if (!value) error = "La contraseña es requerida"
        else if (value.length < 8) error = "Debe tener al menos 8 caracteres"
        else if (passwordStrength.strength < 60) error = "La contraseña debe ser más fuerte"
        break
      case "confirmPassword":
        if (!value) error = "Por favor confirma tu contraseña"
        else if (value !== data.password) error = "Las contraseñas no coinciden"
        break
    }
    
    setErrors(prev => ({ ...prev, [field]: error }))
    return error
  }

  const handleFieldChange = (field: string, value: string) => {
    onChange({ ...data, [field]: value })
    
    // Mark validation hooks as touched when field changes and has content
    if (field === 'email' && value.trim()) emailValidation.markAsTouched()
    if (field === 'username' && value.trim()) usernameValidation.markAsTouched()
    
    if (touched[field]) validateField(field, value)
  }

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    
    if (field === 'email') emailValidation.markAsTouched()
    if (field === 'username') usernameValidation.markAsTouched()
    
    validateField(field, data[field as keyof typeof data])
  }

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value)
    const fullPhone = `${selectedCountry.code}${value}`
    onChange({ ...data, phone: fullPhone })
    if (touched.phone) validateField("phone", fullPhone)
  }

  const handleNext = () => {
    const fields = ["firstName", "lastName", "businessName", "password", "confirmPassword"]
    const newErrors: Record<string, string> = {}
    
    // Mark validation hooks as touched
    if (data.email.trim()) emailValidation.markAsTouched()
    if (data.username.trim()) usernameValidation.markAsTouched()
    
    // Validate regular fields
    fields.forEach(field => {
      const error = validateField(field, data[field as keyof typeof data])
      if (error) newErrors[field] = error
    })
    
    // Check email validation
    if (!data.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (emailValidation.hasError || emailValidation.isValidating || emailValidation.isValid !== true) {
      newErrors.email = emailValidation.error || "Email requerido"
    }
    
    // Check username validation
    if (!data.username.trim()) {
      newErrors.username = "El username es requerido"
    } else if (usernameValidation.hasError || usernameValidation.isValidating || usernameValidation.isValid !== true) {
      newErrors.username = usernameValidation.error || "Username requerido"
    }
    
    // Validate phone if entered
    if (phoneNumber) {
      const phoneError = validateField("phone", phoneNumber)
      if (phoneError) newErrors.phone = phoneError
    }
    
    setErrors(newErrors)
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field]: true }), { email: true, username: true }))
    
    if (Object.keys(newErrors).length === 0) {
      onNext()
    }
  }

  const renderInput = (
    field: string,
    icon: React.ReactNode,
    placeholder: string,
    label: string,
    type: string = "text",
    required: boolean = false,
    options: any = {}
  ) => {
    let hasError: boolean | string = touched[field] && errors[field]
    let isValid: boolean = Boolean(touched[field] && !errors[field] && data[field as keyof typeof data])
    let validationIcon = null
    
    // Special handling for email and username
    if (field === 'email') {
      hasError = emailValidation.hasError
      isValid = emailValidation.isValidAndTouched
      if (emailValidation.isValidating) {
        validationIcon = <Loader2 className="text-blue-500 ml-2 animate-spin" size={20} />
      } else if (emailValidation.isValidAndTouched) {
        validationIcon = <CheckCircle className="text-green-500 ml-2" size={20} />
      } else if (emailValidation.hasError) {
        validationIcon = <XCircle className="text-red-500 ml-2" size={20} />
      }
    } else if (field === 'username') {
      hasError = usernameValidation.hasError
      isValid = usernameValidation.isValidAndTouched
      if (usernameValidation.isValidating) {
        validationIcon = <Loader2 className="text-blue-500 ml-2 animate-spin" size={20} />
      } else if (usernameValidation.isValidAndTouched) {
        validationIcon = <CheckCircle className="text-green-500 ml-2" size={20} />
      } else if (usernameValidation.hasError) {
        validationIcon = <XCircle className="text-red-500 ml-2" size={20} />
      }
    }
    
    const displayError = field === 'email' ? emailValidation.error : 
                        field === 'username' ? usernameValidation.error : 
                        errors[field]
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          <div className={`
            flex ${options.isTextarea ? 'items-start' : 'items-center'} border-2 rounded-xl px-4 bg-white
            transition-all duration-200 shadow-sm hover:shadow-md
            ${hasError ? 'border-red-500 bg-red-50' : 
              isValid ? 'border-green-500 bg-green-50' : 
              'border-gray-200 hover:border-blue-400 focus-within:border-blue-500 focus-within:bg-blue-50'}
          `}>
            <span className={`mr-3 ${options.isTextarea ? 'mt-3' : ''} ${hasError ? 'text-red-500' : isValid ? 'text-green-500' : 'text-gray-400'}`}>
              {icon}
            </span>
            {options.isTextarea ? (
              <textarea
                value={data[field as keyof typeof data]}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                onBlur={() => handleFieldBlur(field)}
                placeholder={placeholder}
                rows={3}
                className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400 resize-none"
              />
            ) : (
              <input
                type={options.isPassword ? (options.showPassword ? "text" : "password") : type}
                value={data[field as keyof typeof data]}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                onBlur={() => handleFieldBlur(field)}
                placeholder={placeholder}
                className="flex-1 py-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                autoComplete={options.autoComplete}
              />
            )}
            {options.isPassword && (
              <button
                type="button"
                onClick={() => options.togglePassword()}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {options.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            )}
            {/* Validation icons */}
            {validationIcon || (isValid && !options.isPassword && !options.isTextarea && (
              <Check className="text-green-500 ml-2" size={20} />
            ))}
            {isValid && options.isTextarea && (
              <Check className="text-green-500 ml-2 mt-3" size={20} />
            )}
          </div>
          {hasError && displayError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"
            >
              <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
              {displayError}
            </motion.p>
          )}
          {/* Success messages */}
          {field === 'email' && emailValidation.isValidAndTouched && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 text-xs mt-1 ml-1 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Email disponible
            </motion.p>
          )}
          {field === 'username' && usernameValidation.isValidAndTouched && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-green-600 text-xs mt-1 ml-1 flex items-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Username disponible
            </motion.p>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
        >
          <User className="text-white" size={40} />
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Información Personal
        </h2>
        <p className="mt-2 text-gray-600">
          Esta información nos ayudará a personalizar tu experiencia
        </p>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput("firstName", <User size={20} />, "Juan", "Nombre", "text", true)}
        {renderInput("lastName", <User size={20} />, "Pérez", "Apellido", "text", true)}
      </div>

      {renderInput("email", <Mail size={20} />, "tu@ejemplo.com", "Correo Electrónico", "email", true)}
      {renderInput("username", <AtSign size={20} />, "mi_usuario", "Nombre de Usuario", "text", true)}
      
      {/* Phone with Country Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Teléfono
        </label>
        <CountrySelector
          selectedCountry={selectedCountry}
          onSelect={setSelectedCountry}
          phoneNumber={phoneNumber}
          onPhoneChange={handlePhoneChange}
        />
        {touched.phone && errors.phone && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 ml-1 flex items-center gap-1"
          >
            <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
            {errors.phone}
          </motion.p>
        )}
      </motion.div>

      {renderInput("businessName", <Building size={20} />, "Mi Empresa", "Nombre de tu Negocio", "text", true)}
      {renderInput(
        "description", 
        <FileText size={20} />, 
        "Describe brevemente qué servicios ofreces...", 
        "Descripción de tu Servicio",
        "text",
        false,
        { isTextarea: true }
      )}

      {/* Password fields */}
      <div className="space-y-4">
        {renderInput(
          "password",
          <Lock size={20} />,
          "••••••••",
          "Contraseña",
          "password",
          true,
          {
            isPassword: true,
            showPassword: showPassword,
            togglePassword: () => setShowPassword(!showPassword),
            autoComplete: "new-password"
          }
        )}
        
        {/* Password Strength Indicator */}
        {data.password && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 bg-gray-50 rounded-xl p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Fuerza de contraseña:</span>
              <span 
                className="text-sm font-bold"
                style={{ color: getPasswordStrengthColor(passwordStrength.strength) }}
              >
                {getPasswordStrengthText(passwordStrength.strength)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  backgroundColor: getPasswordStrengthColor(passwordStrength.strength)
                }}
                initial={{ width: 0 }}
                animate={{ width: `${passwordStrength.strength}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'hasMinLength', text: '8+ caracteres' },
                { key: 'hasUpperCase', text: 'Una mayúscula' },
                { key: 'hasLowerCase', text: 'Una minúscula' },
                { key: 'hasNumber', text: 'Un número' },
                { key: 'hasSpecialChar', text: 'Carácter especial (!@#$%^&*)', colSpan: 'col-span-2' }
              ].map(({ key, text, colSpan }) => (
                <div key={key} className={`flex items-center ${colSpan || ''} ${
                  passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                    <Check size={14} className="mr-1" />
                  ) : (
                    <X size={14} className="mr-1" />
                  )}
                  {text}
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {renderInput(
          "confirmPassword",
          <Lock size={20} />,
          "••••••••",
          "Confirmar Contraseña",
          "password",
          true,
          {
            isPassword: true,
            showPassword: showConfirmPassword,
            togglePassword: () => setShowConfirmPassword(!showConfirmPassword),
            autoComplete: "new-password"
          }
        )}
      </div>

      {/* Continue button */}
      <div className="flex justify-end mt-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-semibold"
        >
          Continuar
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  )
}
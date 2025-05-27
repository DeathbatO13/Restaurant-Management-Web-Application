"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Utensils,
  Coffee,
  Star,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  popular?: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  notes: string
  tableNumber: string
  orderType: "delivery" | "table" | ""
}

const menuData: Record<string, MenuItem[] | Record<string, MenuItem[]>> = {
  desayunos: [
    {
      id: "des1",
      name: "Tradicional",
      description: "Huevos al gusto. Arepa con mantequilla. Queso campesino. Chocolate o Cafe.",
      price: 9000,
      popular: true,
    },
    {
      id: "des2",
      name: "Montañero",
      description:
        "Calentado de frijol, lentejas o pasta con arroz. Chicharron o carne en posta. Arepa con queso. Huevo al gusto. Aguapanela con limon o Cafe.",
      price: 12000,
    },
    {
      id: "des3",
      name: "Americano",
      description:
        "Tostadas con mantequilla o mermelada. Huevo frito o revuelto. Salchichas o jamon. Jugo natural y Cafe.",
      price: 9000,
    },
    {
      id: "des4",
      name: "Ligero",
      description: "Arepa de chocolo o pan. Queso fresco. Fruta picada. Yogurt o aromatica natural.",
      price: 7000,
    },
    {
      id: "des5",
      name: "Huevos al gusto",
      description: "Pericos/Revueltos/Fritos. Pan o arepa. Chocolate, Cafe o aromatica.",
      price: 8000,
    },
  ],
  menu_del_dia: [
    {
      id: "menu1",
      name: "Pollo a la Plancha",
      description: "Pechuga de pollo con arroz, ensalada y patacones",
      price: 18.99,
      popular: true,
    },
    {
      id: "menu2",
      name: "Pescado al Vapor",
      description: "Filete de pescado con vegetales y yuca hervida",
      price: 22.99,
    },
    { id: "menu3", name: "Carne Asada", description: "Bistec de res con arroz, frijoles y ensalada", price: 24.99 },
    { id: "menu4", name: "Pasta Carbonara", description: "Espaguetis con salsa carbonara y tocino", price: 16.99 },
    { id: "menu5", name: "Arroz con Pollo", description: "Arroz amarillo con pollo y vegetales", price: 17.99 },
  ],
  platos_especiales: {
    carnes_y_parrilla: [
      {
        id: "esp1",
        name: "Beef Barril",
        description: "Res a la parrilla estilo especial.",
        price: 33000,
        popular: true,
      },
      { id: "esp2", name: "Bondiola BBQ", description: "Bondiola BBQ al barril", price: 33000 },
      {
        id: "esp3",
        name: "Churrasco al barril",
        description: "Corte jugoso de res a la parrilla con el toque de la casa.",
        price: 33000,
      },
      {
        id: "esp4",
        name: "Costillas BBQ al barril",
        description: "Costillas suaves, bañadas en salsa BBQ y doradas a fuego lento.",
        price: 28000,
      },
      {
        id: "esp5",
        name: "Mix Parrillero",
        description: "Combinacion de res, pollo y chorizo. !Para los que quieren todo!",
        price: 999999,
      },
      {
        id: "esp6",
        name: "Punta de anca a la plancha",
        description: "Acompañada de papas criollas, arroz y ensalada fresca.",
        price: 25000,
      },
      {
        id: "esp7",
        name: "Bistec a caballo",
        description: "Bistec de res en salsa criolla con huevo frito encima, arroz, tajadas y ensalada.",
        price: 22000,
      },
      {
        id: "esp8",
        name: "Sobrebarriga en salsa criolla o al barril",
        description: "Servida con arroz, papa salada y ensalada.",
        price: 28000,
      },
      {
        id: "esp9",
        name: "Lomo en champiñones",
        description: "Lomo de res en salsa cremosa con champiñones. Viene con arroz y puré.",
        price: 28000,
      },
    ],
    pollo: [
      {
        id: "poll1",
        name: "Pollo entero al barril",
        description: "",
        price: 35000,
      },
      {
        id: "poll2",
        name: "Alitas al barril",
        description: "",
        price: 22000,
      },
      {
        id: "poll3",
        name: "Pechuga al Grill",
        description: "Pollo sazonado a la parrilla con toque de limón y finas hierbas.",
        price: 28000,
      },
      {
        id: "poll4",
        name: "Pollo a la criolla",
        description: "Filete de pechuga en salsa criolla con arroz, ensalada y tajadas.",
        price: 28000,
      },
      {
        id: "poll5",
        name: "Pechuga napolitana",
        description: "Pechuga apanada con jamón, queso y salsa napolitana. Servida con papas a la francesa.",
        price: 28000,
      },
    ],
    cerdo: [
      {
        id: "cer1",
        name: "Lomo de cerdo parrillada",
        description: "",
        price: 28000,
      },
      {
        id: "cer2",
        name: "Chuleta Ahumada",
        description: "Chuleta de cerdo marinada y cocida a la brasa",
        price: 28000,
      },
      {
        id: "cer3",
        name: "Costilla chicharrón al barril",
        description: "",
        price: 33000,
      },
      {
        id: "cer4",
        name: "Chuleta valluna",
        description: "Apanada, crocante y jugosa. Acompañada de arroz, tajadas y ensalada.",
        price: 28000,
      },
    ],
    pescados_y_mariscos: [
      {
        id: "pes1",
        name: "Mojarra al barril",
        description: "Mojarra al barril",
        price: 30000,
      },
      {
        id: "pes2",
        name: "Filete de pescado apanado o al ajillo",
        description: "Ideal con arroz con coco y patacón.",
        price: 29000,
      },
      {
        id: "pes3",
        name: "Cazuela de mariscos ",
        description: "Cazuela de mariscos (dia especial)",
        price: 35000,
      },
    ],
  },
  bebidas: [
    {
      id: "beb1",
      name: "Café Colombiano",
      description: "Café premium de origen colombiano",
      price: 3.99,
      popular: true,
    },
    { id: "beb2", name: "Jugo Natural", description: "Naranja, mango, maracuyá o guayaba", price: 4.99 },
    { id: "beb3", name: "Cerveza Nacional", description: "Selección de cervezas locales", price: 5.99 },
    { id: "beb4", name: "Vino de la Casa", description: "Vino tinto o blanco de la casa", price: 7.99 },
    { id: "beb5", name: "Agua con Gas", description: "Agua mineral con gas natural", price: 2.99 },
    { id: "beb6", name: "Limonada", description: "Limonada natural con hierbabuena", price: 3.99 },
  ],
}

const platosEspecialesSubcategories = [
  { key: "carnes_y_parrilla", label: "Carnes y Parrilla" },
  { key: "pollo", label: "Pollo" },
  { key: "cerdo", label: "Cerdo" },
  { key: "pescados_y_mariscos", label: "Pescados y Mariscos" },
] as const

const menuIcons = {
  desayunos: Coffee,
  menu_del_dia: Utensils,
  platos_especiales: Star,
  bebidas: Coffee,
}

export default function RestaurantWebsite() {
  const [activeMenu, setActiveMenu] = useState<keyof typeof menuData>("menu_del_dia")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "orderType" | "info" | "confirmation">("cart")
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    tableNumber: "",
    orderType: "",
  })
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [activeStickyCategory, setActiveStickyCategory] = useState<string>("")
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [sequentialNumber, setSequentialNumber] = useState<number>(1)

  const menuCategories = [
    { key: "desayunos", label: "Desayunos" },
    { key: "menu_del_dia", label: "Menú del día" },
    { key: "platos_especiales", label: "Platos especiales" },
    { key: "bebidas", label: "Bebidas" },
  ] as const

  useEffect(() => {
    if (activeMenu !== "platos_especiales") return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200 // Offset for header

      let currentCategory = ""
      platosEspecialesSubcategories.forEach((subcategory) => {
        const element = categoryRefs.current[subcategory.key]
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = rect.top + window.scrollY
          if (scrollPosition >= elementTop) {
            currentCategory = subcategory.key
          }
        }
      })

      setActiveStickyCategory(currentCategory)
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial call

    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeMenu])

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(id)
    } else {
      setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== item.id))
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getSubtotalWithoutTax = () => {
    const total = getTotal()
    return total / 1.19 // Remove 19% tax to get base price
  }

  const getTax = () => {
    return getTotal() - getSubtotalWithoutTax()
  }

  const handleCheckout = () => {
    if (checkoutStep === "cart") {
      setCheckoutStep("orderType")
    } else if (checkoutStep === "orderType") {
      setCheckoutStep("info")
    } else if (checkoutStep === "info") {
      // Generate order number
      // const orderNum = "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase()
      // Generate 3 random letters
      const letters = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("")

      // Format sequential number with leading zero if needed
      const formattedNumber = sequentialNumber.toString().padStart(2, "0")

      // Create order number
      const orderNum = letters + formattedNumber

      // Update sequential number for next order (reset to 1 after 99)
      setSequentialNumber((prev) => (prev >= 99 ? 1 : prev + 1))
      setOrderNumber(orderNum)
      setCheckoutStep("confirmation")
      // Clear cart after successful order
      setCart([])
    }
  }

  const resetCheckout = () => {
    setCheckoutStep("cart")
    setCustomerInfo({
      name: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
      tableNumber: "",
      orderType: "",
    })
    setIsCartOpen(false)
  }

  const getCurrentMenuItems = () => {
    if (activeMenu === "platos_especiales") {
      return null // We'll render this differently
    }
    return menuData[activeMenu] as MenuItem[]
  }

  const IconComponent = menuIcons[activeMenu]

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-amber-700">Barril 360</h1>

            {/* Cart Button */}
            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative border-amber-200 text-amber-700">
                  <ShoppingCart className="w-4 h-4" />
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:max-w-md">
                {checkoutStep === "cart" && (
                  <>
                    <SheetHeader>
                      <SheetTitle>Tu Pedido</SheetTitle>
                      <SheetDescription>Revisa tus productos antes de continuar</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                      {cart.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Tu carrito está vacío</p>
                      ) : (
                        <>
                          {cart.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">
                                  {item.name}
                                  {item.id.startsWith("des") && (
                                    <span className="text-xs text-gray-500 ml-2">(Desayunos)</span>
                                  )}
                                </h4>
                                <p className="text-amber-700 font-semibold">${item.price.toLocaleString("es-CO")}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="w-8 h-8 p-0 text-red-500"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Subtotal (sin IVA):</span>
                              <span>${getSubtotalWithoutTax().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>IVA (19%):</span>
                              <span>${getTax().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                              <span>Total:</span>
                              <span>${getTotal().toFixed(2)}</span>
                            </div>
                          </div>

                          <Button
                            onClick={handleCheckout}
                            className="w-full bg-amber-700 hover:bg-amber-800"
                            disabled={cart.length === 0}
                          >
                            Continuar
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}

                {checkoutStep === "orderType" && (
                  <>
                    <SheetHeader>
                      <SheetTitle>Tipo de Pedido</SheetTitle>
                      <SheetDescription>¿Cómo deseas recibir tu pedido?</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <Button
                          variant={customerInfo.orderType === "table" ? "default" : "outline"}
                          onClick={() => setCustomerInfo((prev) => ({ ...prev, orderType: "table" }))}
                          className={`h-16 ${
                            customerInfo.orderType === "table"
                              ? "bg-amber-700 hover:bg-amber-800"
                              : "border-amber-200 text-amber-700 hover:bg-amber-50"
                          }`}
                        >
                          <div className="text-center">
                            <Utensils className="w-6 h-6 mx-auto mb-1" />
                            <div className="font-semibold">Comer en Mesa</div>
                            <div className="text-xs opacity-75">Servicio en restaurante</div>
                          </div>
                        </Button>

                        <Button
                          variant={customerInfo.orderType === "delivery" ? "default" : "outline"}
                          onClick={() => setCustomerInfo((prev) => ({ ...prev, orderType: "delivery" }))}
                          className={`h-16 ${
                            customerInfo.orderType === "delivery"
                              ? "bg-amber-700 hover:bg-amber-800"
                              : "border-amber-200 text-amber-700 hover:bg-amber-50"
                          }`}
                        >
                          <div className="text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-1" />
                            <div className="font-semibold">Domicilio</div>
                            <div className="text-xs opacity-75">Entrega a tu dirección</div>
                          </div>
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-6">
                        <Button variant="outline" onClick={() => setCheckoutStep("cart")} className="flex-1">
                          Atrás
                        </Button>
                        <Button
                          onClick={handleCheckout}
                          className="flex-1 bg-amber-700 hover:bg-amber-800"
                          disabled={!customerInfo.orderType}
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {checkoutStep === "info" && (
                  <>
                    <SheetHeader>
                      <SheetTitle>Información del Cliente</SheetTitle>
                      <SheetDescription>
                        {customerInfo.orderType === "delivery"
                          ? "Por favor proporciona tus datos para el domicilio"
                          : "Por favor proporciona tus datos para el pedido en mesa"}
                      </SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                          id="name"
                          value={customerInfo.name}
                          onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Ingresa tu nombre completo"
                        />
                      </div>

                      {customerInfo.orderType === "delivery" && (
                        <>
                          <div>
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerInfo.email}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))}
                              placeholder="Ingresa tu correo electrónico"
                            />
                          </div>

                          <div>
                            <Label htmlFor="phone">Número de Teléfono</Label>
                            <Input
                              id="phone"
                              value={customerInfo.phone}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="Ingresa tu número de teléfono"
                            />
                          </div>

                          <div>
                            <Label htmlFor="address">Dirección de Entrega</Label>
                            <Textarea
                              id="address"
                              value={customerInfo.address}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))}
                              placeholder="Ingresa tu dirección completa"
                              rows={3}
                            />
                          </div>
                        </>
                      )}

                      {customerInfo.orderType === "table" && (
                        <div>
                          <Label htmlFor="tableNumber">Número de Mesa</Label>
                          <Input
                            id="tableNumber"
                            value={customerInfo.tableNumber}
                            onChange={(e) => setCustomerInfo((prev) => ({ ...prev, tableNumber: e.target.value }))}
                            placeholder="Ingresa el número de tu mesa"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="notes">Instrucciones Especiales (Opcional)</Label>
                        <Textarea
                          id="notes"
                          value={customerInfo.notes}
                          onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Solicitudes especiales o restricciones alimentarias"
                          rows={2}
                        />
                      </div>

                      <Separator />

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between font-bold">
                          <span>Total del Pedido:</span>
                          <span>${getTotal().toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCheckoutStep("orderType")} className="flex-1">
                          Atrás
                        </Button>
                        <Button
                          onClick={handleCheckout}
                          className="flex-1 bg-amber-700 hover:bg-amber-800"
                          disabled={
                            !customerInfo.name ||
                            (customerInfo.orderType === "delivery" &&
                              (!customerInfo.email || !customerInfo.phone || !customerInfo.address)) ||
                            (customerInfo.orderType === "table" && !customerInfo.tableNumber)
                          }
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Realizar Pedido
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {checkoutStep === "confirmation" && (
                  <>
                    <SheetHeader>
                      <SheetTitle>¡Pedido Confirmado!</SheetTitle>
                      <SheetDescription>Gracias por tu pedido</SheetDescription>
                    </SheetHeader>

                    <div className="mt-6 text-center space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-green-600 font-semibold text-lg">Pedido #{orderNumber}</div>
                        <p className="text-green-700 text-sm mt-1">
                          Tu pedido ha sido recibido y está siendo preparado
                        </p>
                      </div>

                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{customerInfo.name}</span>
                        </div>
                        {customerInfo.orderType === "delivery" && (
                          <>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{customerInfo.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{customerInfo.phone}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                              <span className="text-sm">{customerInfo.address}</span>
                            </div>
                          </>
                        )}
                        {customerInfo.orderType === "table" && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                            <span className="text-sm">Mesa #{customerInfo.tableNumber}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-amber-800 text-sm">
                          <strong>Tiempo estimado:</strong>{" "}
                          {customerInfo.orderType === "delivery" ? "45-60 minutos" : "15-25 minutos"}
                        </p>
                        <p className="text-amber-800 text-sm mt-1">
                          {customerInfo.orderType === "delivery"
                            ? `Tu pedido será entregado en: ${customerInfo.address}`
                            : `Tu pedido se entregará en tu mesa, número #${customerInfo.tableNumber}`}
                        </p>
                      </div>

                      <Button onClick={resetCheckout} className="w-full bg-amber-700 hover:bg-amber-800">
                        Continuar Comprando
                      </Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Navigation */}
          <nav className="grid grid-cols-2 gap-2">
            {menuCategories.map((category) => (
              <Button
                key={category.key}
                variant={activeMenu === category.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveMenu(category.key)}
                className={`text-xs h-12 ${
                  activeMenu === category.key
                    ? "bg-amber-700 hover:bg-amber-800"
                    : "border-amber-200 text-amber-700 hover:bg-amber-50"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </nav>
        </div>
      </header>

      {/* Sticky Category Header for Platos Especiales */}
      {activeMenu === "platos_especiales" && activeStickyCategory && (
        <div className="sticky top-[140px] z-20 bg-amber-700 text-white py-3 px-4 shadow-md">
          <h3 className="text-lg font-semibold text-center">
            {platosEspecialesSubcategories.find((cat) => cat.key === activeStickyCategory)?.label}
          </h3>
        </div>
      )}

      {/* Menu Content */}
      <main className="px-4 py-6">
        <div className="flex items-center justify-center mb-6">
          <IconComponent className="w-6 h-6 text-amber-700 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {menuCategories.find((cat) => cat.key === activeMenu)?.label}
          </h2>
        </div>

        {/* Regular Menu Items */}
        {activeMenu !== "platos_especiales" && (
          <div className="space-y-4">
            {getCurrentMenuItems()?.map((item) => (
              <Card key={item.id} className="shadow-sm border-amber-100">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                      {item.name}
                      {item.popular && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                          Popular
                        </Badge>
                      )}
                    </CardTitle>
                    <span className="text-lg font-bold text-amber-700">${item.price.toLocaleString("es-CO")}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-gray-600 mb-3">{item.description}</CardDescription>
                  <Button onClick={() => addToCart(item)} size="sm" className="w-full bg-amber-700 hover:bg-amber-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar al Carrito
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Platos Especiales with Categories */}
        {activeMenu === "platos_especiales" && (
          <div className="space-y-8">
            {platosEspecialesSubcategories.map((subcategory) => {
              const subcategoryData = menuData[activeMenu] as Record<string, MenuItem[]>
              const items = subcategoryData[subcategory.key] || []

              return (
                <div
                  key={subcategory.key}
                  ref={(el) => (categoryRefs.current[subcategory.key] = el)}
                  className="space-y-4"
                >
                  <div className="text-center py-4">
                    <h3 className="text-2xl font-bold text-amber-700 mb-2">{subcategory.label}</h3>
                    <div className="w-20 h-1 bg-amber-700 mx-auto rounded"></div>
                  </div>

                  {items.length > 0 ? (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <Card key={item.id} className="shadow-sm border-amber-100">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                                {item.name}
                                {item.popular && (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </CardTitle>
                              <span className="text-lg font-bold text-amber-700">
                                ${item.price.toLocaleString("es-CO")}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-gray-600 mb-3">{item.description}</CardDescription>
                            <Button
                              onClick={() => addToCart(item)}
                              size="sm"
                              className="w-full bg-amber-700 hover:bg-amber-800"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar al Carrito
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No hay productos disponibles en esta categoría</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 px-4 mt-8">
        <div className="text-center">
          <h3 className="font-semibold mb-2">Restaurante Barril 360</h3>
          <p className="text-sm text-gray-300 mb-1">Calle 123 #45-67, Centro</p>
          <p className="text-sm text-gray-300 mb-1">Teléfono: (555) 123-4567</p>
          <p className="text-sm text-gray-300">Abierto todos los días: 11:00 AM - 10:00 PM</p>
        </div>
      </footer>
    </div>
  )
}

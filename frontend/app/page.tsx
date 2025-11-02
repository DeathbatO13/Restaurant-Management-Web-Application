"use client";

export const dynamic = "force-dynamic";

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import React from 'react';
import { JSX } from 'react';

interface MenuItem {
  id: string
  nombre: string
  descripcion: string
  precio: number
  popular?: boolean
  categoria?: string
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

const platosEspecialesSubcategories = [
  { key: "carnes_y_parrilla", label: "Carnes y Parrilla" },
  { key: "pollo", label: "Pollo" },
  { key: "cerdo", label: "Cerdo" },
  { key: "pescados_y_mariscos", label: "Pescados y Mariscos" },
] as const

const bebidasSubcategories = [
  { key: "bebidas_naturales", label: "Bebidas Naturales" },
  { key: "bebidas_comerciales", label: "Bebidas Comerciales" },
  { key: "bebidas_calientes", label: "Bebidas Calientes" },
] as const

const menuIcons = {
  desayunos: Coffee,
  menu_del_dia: Utensils,
  platos_especiales: Star,
  bebidas: Coffee,
}

export default function Page() {
  const [activeMenu, setActiveMenu] = useState<string>("menu_del_dia")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "orderType" | "info" | "confirmation">("orderType")
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

  const [showAdmin, setShowAdmin] = useState(false)
  const [adminPin, setAdminPin] = useState("")
  const [isPinValid, setIsPinValid] = useState(false)

  const [visibleItems, setVisibleItems] = useState<Record<string, boolean>>({})
  const [menuData, setMenuData] = useState<any>(null)
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [allDishes, setAllDishes] = useState<any[]>([])

  const [showEditMenuDiaModal, setShowEditMenuDiaModal] = useState(false)
  const [editMenuDia, setEditMenuDia] = useState<any>(null)
  const [showVentasModal, setShowVentasModal] = useState(false)
  const [ventasHoy, setVentasHoy] = useState<{ total: number, platos_vendidos: Record<string, Record<string, number>> } | null>(null)
  const [ventasLoading, setVentasLoading] = useState(false)

  const categoriaLabels: Record<string, string> = {
    menu_del_dia: "Menú del Día",
    desayunos: "Desayunos",
    platos_especiales: "Platos Especiales",
    carnes_y_parrilla: "Carnes y Parrilla",
    pollo: "Pollo",
    cerdo: "Cerdo",
    pescados_y_mariscos: "Pescados y Mariscos",
    bebidas: "Bebidas",
    bebidas_naturales: "Bebidas Naturales",
    bebidas_comerciales: "Bebidas Comerciales",
    bebidas_calientes: "Bebidas Calientes",
    otros: "Otros",
  }

  // Estado para nuevo plato
  const [newDish, setNewDish] = useState({
    category: "desayunos",
    subcategory: "",
    name: "",
    description: "",
    price: "",
  });

  const menuCategories = [
    { key: "desayunos", label: "Desayunos" },
    { key: "menu_del_dia", label: "Menú del día" },
    { key: "platos_especiales", label: "Platos especiales" },
    { key: "bebidas", label: "Bebidas" },
  ] as const

  // Only show categories that are enabled
  const filteredMenuCategories = menuCategories.filter((cat) => visibleItems[cat.key])

  const DELIVERY_FEE = 10000

  useEffect(() => {
    fetch("/api/admin/menu")
      .then((res) => res.json())
      .then((data) => {
        setMenuData(data)
        setLoadingMenu(false)
      })
      .catch(() => setLoadingMenu(false))
  }, [])

  useEffect(() => {
    const today = new Date().getDay()
    if (today === 0 || today === 6) {
      setActiveMenu("platos_especiales")
    } else {
      setActiveMenu("menu_del_dia")
    }
  }, [])

  useEffect(() => {
    if (showAdmin && isPinValid) {
      fetchTodosLosPlatos()
    }
  }, [showAdmin, isPinValid])

  useEffect(() => {
    if (!menuData) return

    const result: Record<string, boolean> = {}
    Object.entries(menuData).forEach(([_catKey, catValue]) => {
      if (Array.isArray(catValue)) {
        catValue.forEach((item: MenuItem) => {
          result[item.id] = true
        })
      } else if (typeof catValue === "object" && catValue !== null) {
        Object.values(catValue).forEach((subcat: any) => {
          if (Array.isArray(subcat)) {
            subcat.forEach((item: MenuItem) => {
              result[item.id] = true
            })
          }
        })
      }
    })
    setVisibleItems(result)
  }, [menuData])

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
    setCart((prevCart: CartItem[]) => {
      const existingItem = prevCart.find((cartItem: CartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem: CartItem) =>
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
      setCart((prevCart: CartItem[]) => prevCart.map((item: CartItem) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeFromCart = (id: string) => {
    setCart((prevCart: CartItem[]) => prevCart.filter((item: CartItem) => item.id !== id))
  }

  const getTotalItems = () => {
    return cart.reduce((total: number, item: CartItem) => total + item.quantity, 0)
  }

  const getTotal = () => {
    const baseTotal = cart.reduce((total: number, item: CartItem) => total + item.precio * item.quantity, 0)
    return customerInfo.orderType === "delivery" ? baseTotal + DELIVERY_FEE : baseTotal
  }

  const getSubtotalWithoutTax = () => {
    const total = getTotal()
    return total / 1.19 // Remove 19% tax to get base price
  }

  const getTax = () => {
    return getTotal() - getSubtotalWithoutTax()
  }

  const handleCheckout = async () => {
    if (checkoutStep === "cart") {
      setCheckoutStep("orderType")
    } else if (checkoutStep === "orderType") {
      setCheckoutStep("info")
    } else if (checkoutStep === "info") {
      // Generar número de pedido
      const orderNum = "ORD" + Math.random().toString(36).substr(2, 9).toUpperCase()
      setOrderNumber(orderNum)
      // Enviar pedido al backend
      try {
        const response = await fetch("/api/pedidos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: customerInfo.name,
            tipo: customerInfo.orderType,
            mesa: customerInfo.orderType === "table" ? customerInfo.tableNumber : "",
            direccion: customerInfo.orderType === "delivery" ? customerInfo.address : "",
            telefono: customerInfo.orderType === "delivery" ? customerInfo.phone : "",
            platos: cart.map(item => ({
              nombre: item.nombre,
              quantity: item.quantity,
              precio: item.precio,
              categoria: item.categoria || 'otros',
            })),
            postre: 0,
            total: getTotal(),
            notas: customerInfo.notes,
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("Error al guardar el pedido:", errorData)
          alert("Hubo un error al procesar tu pedido. Por favor intenta de nuevo.")
          return
        }
      } catch (e) {
        console.error("Error de red al guardar el pedido:", e)
        alert("No se pudo conectar con el servidor. Por favor verifica tu conexión.")
        return
      }
      setCheckoutStep("confirmation")
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

  const IconComponent = menuIcons[activeMenu as keyof typeof menuIcons] || (() => null);
  
  const fetchTodosLosPlatos = async () => {
    try {
      const res = await fetch("/api/admin/platos");
      if (!res.ok) {
        console.error("Error al cargar platos:", res.statusText);
        return;
      }
      const data = await res.json();
      setAllDishes(data);

      const nuevoMenu = {
        desayunos: [],
        menu_del_dia: [],
        platos_especiales: {
          carnes_y_parrilla: [],
          pollo: [],
          cerdo: [],
          pescados_y_mariscos: []
        },
        bebidas: {
          bebidas_naturales: [],
          bebidas_comerciales: [],
          bebidas_calientes: []
        }
      };

      data.forEach((plato: any) => {
        const cat = plato.categoria;
        if (cat in nuevoMenu) {
          (nuevoMenu as any)[cat].push(plato);
        } else if (cat in (nuevoMenu as any).platos_especiales) {
          (nuevoMenu as any).platos_especiales[cat].push(plato);
        } else if (cat in (nuevoMenu as any).bebidas) {
          (nuevoMenu as any).bebidas[cat].push(plato);
        }
      });

      setMenuData(nuevoMenu);

      // ids como string para visMap
      const visMap: Record<string, boolean> = {};
      data.forEach((p: any) => {
        visMap[String(p.id)] = p.visible === 1;
      });
      setVisibleItems(visMap);
    } catch (error) {
      console.error("Error al obtener platos:", error);
    }
  };

  const handlePinSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (adminPin === "4328") {
      setIsPinValid(true);
    } else {
      alert("PIN incorrecto");
    }
  };

  const handleMenuVisibilityChange = (key: string) => {
    setVisibleItems((prev: Record<string, boolean>) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Función para alternar visibilidad de un plato
  const toggleVisibilidad = async (id: string, visible: boolean) => {
    try {
      const response = await fetch(`/api/admin/platos/${id}/visibilidad`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
      if (!response.ok) {
        console.error("Error al actualizar visibilidad:", response.statusText);
        return;
      }
      setVisibleItems((prev) => ({ ...prev, [id]: visible }));
    } catch (error) {
      console.error("Error de red al actualizar visibilidad:", error);
    }
  };

  // Función para obtener subcategorías según categoría
  const getSubcategories = (category: string) => {
    if (category === "platos_especiales") return platosEspecialesSubcategories;
    if (category === "bebidas") return bebidasSubcategories;
    return [];
  };

  // 2. Antes de renderizar el menú, muestra un loader si está cargando:
  if (loadingMenu || !menuData) {
    return <div>Loading...</div> as JSX.Element;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-amber-700">Barril 360</h1>
            <div className="flex items-center gap-2">
              {/* Admin Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdmin(true)}
                className="text-gray-600 hover:text-gray-800"
              >
                <User className="w-4 h-4" />
              </Button>
              {/* Cart Button */}
              <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="relative border-amber-200 text-amber-700"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-amber-700 text-white text-xs w-5 h-5 rounded-full p-0 flex items-center justify-center">
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-md">
                {/* Paso: Tipo de pedido */}
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
                          className={`h-16 ${customerInfo.orderType === "table" ? "bg-amber-700 hover:bg-amber-800" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
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
                          className={`h-16 ${customerInfo.orderType === "delivery" ? "bg-amber-700 hover:bg-amber-800" : "border-amber-200 text-amber-700 hover:bg-amber-50"}`}
                        >
                          <div className="text-center">
                            <MapPin className="w-6 h-6 mx-auto mb-1" />
                            <div className="font-semibold">Domicilio</div>
                            <div className="text-xs opacity-75">Entrega a tu dirección</div>
                          </div>
                        </Button>
                      </div>
                      <div className="flex gap-2 mt-6">
                        <Button variant="outline" onClick={() => setIsCartOpen(false)} className="flex-1">Cerrar</Button>
                        <Button onClick={() => setCheckoutStep("cart")}
                          className="flex-1 bg-amber-700 hover:bg-amber-800"
                          disabled={!customerInfo.orderType}
                        >
                          Continuar
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                {/* Paso: Carrito */}
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
                                <h4 className="font-medium text-sm">{item.nombre}</h4>
                                <p className="text-amber-700 font-semibold">
                                  {item.precio !== undefined
                                    ? `$${item.precio.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                    : "Precio no disponible"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 p-0"><Minus className="w-3 h-3" /></Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button variant="outline" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 p-0"><Plus className="w-3 h-3" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} className="w-8 h-8 p-0 text-red-500"><Trash2 className="w-3 h-3" /></Button>
                              </div>
                            </div>
                          ))}
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex justify-between"><span>Subtotal (sin IVA):</span><span>{typeof getSubtotalWithoutTax() === "number" ? `$${getSubtotalWithoutTax().toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "$0"}</span></div>
                            <div className="flex justify-between"><span>IVA (19%):</span><span>{typeof getTax() === "number" ? `$${getTax().toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "$0"}</span></div>
                            <div className="flex justify-between font-bold text-lg"><span>Total:</span><span>{typeof getTotal() === "number" ? `$${getTotal().toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "$0"}</span></div>
                          </div>
                          {customerInfo.orderType === "delivery" && (
                            <div className="bg-amber-100 border border-amber-300 text-amber-800 rounded p-2 mb-2 text-center text-sm">
                              Se agregará un cargo de domicilio de ${DELIVERY_FEE.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} al total.
                            </div>
                          )}
                          <Button onClick={() => setCheckoutStep("orderType")} className="w-full bg-amber-700 hover:bg-amber-800 mt-2">Tipo de Pedido</Button>
                          <Button onClick={handleCheckout} className="w-full bg-amber-700 hover:bg-amber-800 mt-2" disabled={cart.length === 0}>Continuar</Button>
                        </>
                      )}
                    </div>
                  </>
                )}
                {/* Paso: Información del cliente */}
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
                        <Input id="name" value={customerInfo.name} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))} placeholder="Ingresa tu nombre completo" />
                      </div>
                      {customerInfo.orderType === "delivery" && (
                        <>
                          <div>
                            <Label htmlFor="email">Correo Electrónico</Label>
                            <Input id="email" type="email" value={customerInfo.email} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, email: e.target.value }))} placeholder="Ingresa tu correo electrónico" />
                          </div>
                          <div>
                            <Label htmlFor="phone">Número de Teléfono</Label>
                            <Input id="phone" value={customerInfo.phone} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Ingresa tu número de teléfono" />
                          </div>
                          <div>
                            <Label htmlFor="address">Dirección de Entrega</Label>
                            <Textarea id="address" value={customerInfo.address} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, address: e.target.value }))} placeholder="Ingresa tu dirección completa" rows={3} />
                          </div>
                        </>
                      )}
                      {customerInfo.orderType === "table" && (
                        <div>
                          <Label htmlFor="tableNumber">Número de Mesa</Label>
                          <Input id="tableNumber" value={customerInfo.tableNumber} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, tableNumber: e.target.value }))} placeholder="Ingresa el número de tu mesa" />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="notes">Instrucciones Especiales (Opcional)</Label>
                        <Textarea id="notes" value={customerInfo.notes} onChange={(e) => setCustomerInfo((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Solicitudes especiales o restricciones alimentarias" rows={2} />
                      </div>
                      <Separator />
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between font-bold">
                          <span>Total del Pedido:</span>
                          <span>${typeof getTotal() === "number" ? getTotal().toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "0"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setCheckoutStep("orderType")} className="flex-1">Atrás</Button>
                        <Button onClick={handleCheckout} className="flex-1 bg-amber-700 hover:bg-amber-800" disabled={
                          !customerInfo.name ||
                          (customerInfo.orderType === "delivery" && (!customerInfo.email || !customerInfo.phone || !customerInfo.address)) ||
                          (customerInfo.orderType === "table" && !customerInfo.tableNumber)
                        }>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Realizar Pedido
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                {/* Paso: Confirmación */}
                {checkoutStep === "confirmation" && (
                  <>
                    <SheetHeader>
                      <SheetTitle>¡Pedido Confirmado!</SheetTitle>
                      <SheetDescription>Gracias por tu pedido</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 text-center space-y-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-green-600 font-semibold text-lg">Pedido #{orderNumber}</div>
                        <p className="text-green-700 text-sm mt-1">Tu pedido ha sido recibido y está siendo preparado</p>
                      </div>
                      <div className="space-y-2 text-left">
                        <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-500" /><span className="text-sm">{customerInfo.name}</span></div>
                        {customerInfo.orderType === "delivery" && (
                          <>
                            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /><span className="text-sm">{customerInfo.email}</span></div>
                            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span className="text-sm">{customerInfo.phone}</span></div>
                            <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-500 mt-0.5" /><span className="text-sm">{customerInfo.address}</span></div>
                          </>
                        )}
                        {customerInfo.orderType === "table" && (
                          <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gray-500 mt-0.5" /><span className="text-sm">Mesa #{customerInfo.tableNumber}</span></div>
                        )}
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-amber-800 text-sm"><strong>Tiempo estimado:</strong> {customerInfo.orderType === "delivery" ? "45-60 minutos" : "15-25 minutos"}</p>
                        <p className="text-amber-800 text-sm mt-1">{customerInfo.orderType === "delivery" ? `Tu pedido será entregado en: ${customerInfo.address}` : `Tu pedido se entregará en tu mesa, número #${customerInfo.tableNumber}`}</p>
                      </div>
                      <Button onClick={resetCheckout} className="w-full bg-amber-700 hover:bg-amber-800">Continuar Comprando</Button>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>
            </div>
          </div>
          {/* Navegación de categorías */}
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

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="flex items-center justify-center mb-6">
          <IconComponent className="w-6 h-6 text-amber-700 mr-2" />
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {menuCategories.find((cat) => cat.key === activeMenu)?.label}
          </h2>
        </div>

        {/* Renderizado de productos y subcategorías */}
        {/* Bebidas con subcategorías */}
        {activeMenu === "bebidas" && (
          <div className="space-y-8">
            {bebidasSubcategories.map((subcategory) => {
              const subcategoryData = menuData[activeMenu] as Record<string, MenuItem[]>;
              const items = subcategoryData[subcategory.key] || [];
              return (
                <div key={subcategory.key} className="space-y-4">
                  <div className="text-center py-4">
                    <h3 className="text-2xl font-bold text-amber-700 mb-2">{subcategory.label}</h3>
                    <div className="w-20 h-1 bg-amber-700 mx-auto rounded"></div>
                  </div>
                  {Array.isArray(items) && items.length > 0 ? (
                    <div className="space-y-4">
                      {items.filter(item => visibleItems[item.id]).map((item) => (
                        <Card key={item.id} className="shadow-sm border-amber-100">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                                {item.nombre}
                                {item.popular && (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </CardTitle>
                              <span className="text-lg font-bold text-amber-700">
                                {typeof item.precio === "number"
                                  ? `$${item.precio.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                  : "Precio no disponible"}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-gray-600 mb-3">{item.descripcion}</CardDescription>
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
              );
            })}
          </div>
        )}

        {/* Menú regular (no platos especiales) */}
        {activeMenu !== "platos_especiales" && Array.isArray(getCurrentMenuItems()) && (
          <div className="space-y-4">
            {getCurrentMenuItems()?.filter(item => visibleItems[item.id]).map((item) => (
              <Card key={item.id} className="shadow-sm border-amber-100">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                      {item.nombre}
                      {item.popular && (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                          Popular
                        </Badge>
                      )}
                    </CardTitle>
                    <span className="text-lg font-bold text-amber-700">
                      {typeof item.precio === "number"
                        ? `$${item.precio.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                        : "Precio no disponible"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {activeMenu === "menu_del_dia" ? (
                    <div className="text-gray-600 mb-3">
                      <ul className="list-disc list-inside space-y-1">
                        {item.descripcion.split("\n").map((point, index) => (
                          <li key={index} className="text-sm">
                            {point.replace("• ", "")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <CardDescription className="text-gray-600 mb-3">{item.descripcion}</CardDescription>
                  )}
                  <Button onClick={() => addToCart(item)} size="sm" className="w-full bg-amber-700 hover:bg-amber-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar al Carrito
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Platos especiales con subcategorías */}
        {activeMenu === "platos_especiales" && (
          <div className="space-y-8">
            {platosEspecialesSubcategories.map((subcategory) => {
              const subcategoryData = menuData[activeMenu] as Record<string, MenuItem[]>;
              const items = subcategoryData[subcategory.key] || [];
              return (
                <div key={subcategory.key} className="space-y-4">
                  <div className="text-center py-4">
                    <h3 className="text-2xl font-bold text-amber-700 mb-2">{subcategory.label}</h3>
                    <div className="w-20 h-1 bg-amber-700 mx-auto rounded"></div>
                  </div>
                  {items.filter(item => visibleItems[item.id]).length > 0 ? (
                    <div className="space-y-4">
                      {items.filter(item => visibleItems[item.id]).map((item) => (
                        <Card key={item.id} className="shadow-sm border-amber-100">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                                {item.nombre}
                                {item.popular && (
                                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </CardTitle>
                              <span className="text-lg font-bold text-amber-700">
                                {typeof item.precio === "number"
                                  ? `$${item.precio.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                                  : "Precio no disponible"}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <CardDescription className="text-gray-600 mb-3">{item.descripcion}</CardDescription>
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
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-amber-700 text-white py-6 px-4 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Image
              src="/barril360-bg.jpg"
              alt="Barril 360 Logo"
              width={64}
              height={64}
              className="rounded shadow"
              style={{ background: "#fff" }}
            />
            <div>
              <h3 className="font-semibold mb-1">Restaurante Barril 360</h3>
              <p className="text-sm text-amber-100 mb-1">Calle 123 #45-67, Centro</p>
              <p className="text-sm text-amber-100 mb-1">Teléfono: (555) 123-4567</p>
              <p className="text-sm text-amber-100">Abierto todos los días: 11:00 AM - 10:00 PM</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-200 text-amber-700 bg-white hover:bg-amber-50"
            onClick={() => setShowAdmin(true)}
          >
            Admin
          </Button>
        </div>
      </footer>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrito ({getTotalItems()})
            </SheetTitle>
          </SheetHeader>

          {checkoutStep === "cart" && (
            <div className="space-y-4 mt-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Tu carrito está vacío</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.nombre}</h4>
                          <p className="text-sm text-gray-600">${item.precio.toLocaleString("es-CO")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${getSubtotalWithoutTax().toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IVA (19%):</span>
                      <span>${getTax().toLocaleString("es-CO")}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${getTotal().toLocaleString("es-CO")}</span>
                    </div>
                  </div>

                  <Button onClick={() => setCheckoutStep("orderType")} className="w-full">
                    Continuar al Checkout
                  </Button>
                </>
              )}
            </div>
          )}

          {checkoutStep === "orderType" && (
            <div className="space-y-4 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Tipo de Pedido</h3>
              </div>

              <div className="space-y-3">
                <Button
                  variant={customerInfo.orderType === "table" ? "default" : "outline"}
                  className="w-full h-16 text-left justify-start"
                  onClick={() => setCustomerInfo({ ...customerInfo, orderType: "table" })}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Utensils className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-medium">Comer en el Restaurante</div>
                      <div className="text-sm text-gray-600">Selecciona tu mesa</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant={customerInfo.orderType === "delivery" ? "default" : "outline"}
                  className="w-full h-16 text-left justify-start"
                  onClick={() => setCustomerInfo({ ...customerInfo, orderType: "delivery" })}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <div className="font-medium">Domicilio</div>
                      <div className="text-sm text-gray-600">Envío a domicilio</div>
                    </div>
                  </div>
                </Button>
              </div>

              {customerInfo.orderType && (
                <div className="space-y-3">
                  {customerInfo.orderType === "table" && (
                    <div>
                      <Label htmlFor="tableNumber">Número de Mesa</Label>
                      <Input
                        id="tableNumber"
                        value={customerInfo.tableNumber}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
                        placeholder="Ej: Mesa 5"
                      />
                    </div>
                  )}

                  <Button
                    onClick={() => setCheckoutStep("info")}
                    disabled={customerInfo.orderType === "table" && !customerInfo.tableNumber}
                    className="w-full"
                  >
                    Continuar
                  </Button>
                </div>
              )}
            </div>
          )}

          {checkoutStep === "info" && (
            <div className="space-y-4 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Tu nombre completo"
                  />
                </div>

                {/* Mostrar teléfono solo para delivery */}
                {customerInfo.orderType === "delivery" && (
                  <div>
                    <Label htmlFor="phone">Teléfono *</Label>
                    <Input
                      id="phone"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="Tu número de teléfono"
                    />
                  </div>
                )}

                {/* Mostrar número de mesa solo para pedidos en mesa */}
                {customerInfo.orderType === "table" && (
                  <div>
                    <Label htmlFor="tableNumber">Número de Mesa *</Label>
                    <Input
                      id="tableNumber"
                      value={customerInfo.tableNumber}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, tableNumber: e.target.value })}
                      placeholder="Ej: Mesa 5"
                    />
                  </div>
                )}

                {customerInfo.orderType === "delivery" && (
                  <div>
                    <Label htmlFor="address">Dirección de Entrega *</Label>
                    <Textarea
                      id="address"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                      placeholder="Dirección completa para la entrega"
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Instrucciones especiales, alergias, etc."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={() => setCheckoutStep("confirmation")}
                    disabled={
                      !customerInfo.name ||
                      (customerInfo.orderType === "delivery" && (!customerInfo.phone || !customerInfo.address)) ||
                      (customerInfo.orderType === "table" && !customerInfo.tableNumber)
                    }
                    className="w-full"
                  >
                    Revisar Pedido
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCheckoutStep("orderType")}
                    className="w-full"
                  >
                    Atrás
                  </Button>
                </div>
              </div>
            </div>
          )}

          {checkoutStep === "confirmation" && (
            <div className="space-y-4 mt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">¡Pedido Confirmado!</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Pedido #{orderNumber}</h4>
                  <div className="text-green-700 text-sm mt-1">Tu pedido ha sido recibido y está siendo preparado</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Información de Contacto</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Nombre:</strong> {customerInfo.name}</p>
                    {customerInfo.orderType === "delivery" && (
                      <>
                        <p><strong>Teléfono:</strong> {customerInfo.phone}</p>
                        <p><strong>Dirección:</strong> {customerInfo.address}</p>
                      </>
                    )}
                    {customerInfo.orderType === "table" && (
                      <p><strong>Mesa:</strong> {customerInfo.tableNumber}</p>
                    )}
                    {customerInfo.notes && (
                      <p><strong>Notas:</strong> {customerInfo.notes}</p>
                    )}
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-amber-800 text-sm"><strong>Tiempo estimado:</strong> {customerInfo.orderType === "delivery" ? "45-60 minutos" : "15-25 minutos"}</p>
                  <p className="text-amber-800 text-sm mt-1">{customerInfo.orderType === "delivery" ? `Tu pedido será entregado en: ${customerInfo.address}` : `Tu pedido se entregará en tu mesa, número #${customerInfo.tableNumber}`}</p>
                </div>
                <div className="space-y-2">
                  <Button onClick={resetCheckout} className="w-full bg-amber-700 hover:bg-amber-800">Continuar Comprando</Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Admin Panel */}
      {showAdmin && (
        <Dialog open={showAdmin} onOpenChange={open => {
          setShowAdmin(open)
          setAdminPin("")
          setIsPinValid(false)
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Panel de Administración</DialogTitle>
            </DialogHeader>
            {!isPinValid ? (
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <Label htmlFor="admin-pin">Ingresa el PIN de administrador</Label>
                <Input
                  id="admin-pin"
                  type="password"
                  value={adminPin}
                  onChange={e => setAdminPin(e.target.value)}
                  autoFocus
                  maxLength={8}
                  className="w-full"
                />
                <DialogFooter>
                  <Button type="submit" className="bg-amber-700 hover:bg-amber-800 w-full">Ingresar</Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Botón de resumen de ventas */}
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 mb-2"
                  onClick={async () => {
                    setVentasLoading(true)
                    setShowVentasModal(true)
                    try {
                      const res = await fetch("/api/admin/ventas/hoy")
                      if (!res.ok) {
                        console.error("Error al cargar ventas:", res.statusText)
                        setVentasHoy(null)
                      } else {
                        const data = await res.json()
                        setVentasHoy(data)
                      }
                    } catch (error) {
                      console.error("Error de red al cargar ventas:", error)
                      setVentasHoy(null)
                    } finally {
                      setVentasLoading(false)
                    }
                  }}
                >
                  Ver resumen de ventas de hoy
                </Button>

                <div className="font-semibold mb-2">Visibilidad de productos por categoría:</div>
                <Accordion type="multiple" className="w-full">
                  {menuCategories
                    .filter(cat => cat.key !== "menu_del_dia")
                    .map(cat => {
                      let items: MenuItem[] = []
                      if (cat.key === "platos_especiales") {
                        return (
                          <AccordionItem key={cat.key} value={cat.key}>
                            <AccordionTrigger>{cat.label}</AccordionTrigger>
                            <AccordionContent>
                              {platosEspecialesSubcategories.map(subcat => {
                                const subItems = allDishes.filter(
                                  (dish: any) => dish.categoria === subcat.key
                                )
                                return (
                                  <div key={subcat.key} className="mb-2">
                                    <div className="font-semibold text-sm mb-1">{subcat.label}</div>
                                    {subItems.length > 0 ? (
                                      subItems.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-2 mb-1">
                                          <Button
                                            onClick={async () => {
                                              await toggleVisibilidad(item.id, !visibleItems[item.id])
                                            }}
                                            className={`px-2 py-1 rounded text-white ${visibleItems[item.id] ? 'bg-red-500' : 'bg-green-500'}`}
                                          >
                                            {visibleItems[item.id] ? 'Ocultar' : 'Mostrar'}
                                          </Button>
                                          <span>{item.nombre}</span>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={async () => {
                                              if (window.confirm(`¿Eliminar el plato "${item.nombre}"?`)) {
                                                try {
                                                  const response = await fetch(`/api/admin/platos/${item.id}`, { method: "DELETE" })
                                                  if (!response.ok) {
                                                    console.error("Error al eliminar plato:", response.statusText)
                                                    alert("Hubo un error al eliminar el plato")
                                                    return
                                                  }
                                                  fetchTodosLosPlatos()
                                                } catch (error) {
                                                  console.error("Error de red al eliminar plato:", error)
                                                  alert("Error de conexión al eliminar plato")
                                                }
                                              }
                                            }}
                                          >
                                            Eliminar
                                          </Button>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-gray-400 text-xs">Sin platos</span>
                                    )}
                                  </div>
                                )
                              })}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      } else if (cat.key === "bebidas") {
                        return (
                          <AccordionItem key={cat.key} value={cat.key}>
                            <AccordionTrigger>{cat.label}</AccordionTrigger>
                            <AccordionContent>
                              {bebidasSubcategories.map(subcat => {
                                const subItems = allDishes.filter(
                                  (dish: any) => dish.categoria === subcat.key
                                )
                                return (
                                  <div key={subcat.key} className="mb-2">
                                    <div className="font-semibold text-sm mb-1">{subcat.label}</div>
                                    {subItems.length > 0 ? (
                                      subItems.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-2 mb-1">
                                          <Button
                                            onClick={async () => {
                                              await toggleVisibilidad(item.id, !visibleItems[item.id])
                                            }}
                                            className={`px-2 py-1 rounded text-white ${visibleItems[item.id] ? 'bg-red-500' : 'bg-green-500'}`}
                                          >
                                            {visibleItems[item.id] ? 'Ocultar' : 'Mostrar'}
                                          </Button>
                                          <span>{item.nombre}</span>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={async () => {
                                              if (window.confirm(`¿Eliminar el plato "${item.nombre}"?`)) {
                                                try {
                                                  const response = await fetch(`/api/admin/platos/${item.id}`, { method: "DELETE" })
                                                  if (!response.ok) {
                                                    console.error("Error al eliminar plato:", response.statusText)
                                                    alert("Hubo un error al eliminar el plato")
                                                    return
                                                  }
                                                  fetchTodosLosPlatos()
                                                } catch (error) {
                                                  console.error("Error de red al eliminar plato:", error)
                                                  alert("Error de conexión al eliminar plato")
                                                }
                                              }
                                            }}
                                          >
                                            Eliminar
                                          </Button>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-gray-400 text-xs">Sin bebidas</span>
                                    )}
                                  </div>
                                )
                              })}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      } else {
                        items = allDishes.filter((dish: any) => dish.categoria === cat.key)
                        return (
                          <AccordionItem key={cat.key} value={cat.key}>
                            <AccordionTrigger>{cat.label}</AccordionTrigger>
                            <AccordionContent>
                              {items.length > 0 ? (
                                items.map((item: any) => (
                                  <div key={item.id} className="flex items-center gap-2 mb-1">
                                    <Button
                                      onClick={async () => {
                                        await toggleVisibilidad(item.id, !visibleItems[item.id])
                                      }}
                                      className={`px-2 py-1 rounded text-white ${visibleItems[item.id] ? 'bg-red-500' : 'bg-green-500'}`}
                                    >
                                      {visibleItems[item.id] ? 'Ocultar' : 'Mostrar'}
                                    </Button>
                                    <span>{item.nombre}</span>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={async () => {
                                        if (window.confirm(`¿Eliminar el plato "${item.nombre}"?`)) {
                                          await fetch(`/api/admin/platos/${item.id}`, { method: "DELETE" })
                                          fetchTodosLosPlatos()
                                        }
                                      }}
                                    >
                                      Eliminar
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400 text-xs">Sin platos</span>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        )
                      }
                    })}
                </Accordion>
                {/* Menús del día */}
                <div className="border-t pt-4 mt-4">
                  <div className="font-semibold mb-2">Menús del día (solo uno visible por día):</div>
                  {allDishes
                    .filter((dish: any) => dish.categoria === "menu_del_dia")
                    .map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 mb-1">
                        <Button
                          onClick={async () => {
                            // Solo permite mostrar uno a la vez
                            if (!visibleItems[item.id]) {
                              // Oculta todos los menús del día primero
                              const menusDia = allDishes.filter((d: any) => d.categoria === "menu_del_dia")
                              for (const menu of menusDia) {
                                if (visibleItems[menu.id]) {
                                  await toggleVisibilidad(menu.id, false)
                                }
                              }
                            }
                            await toggleVisibilidad(item.id, !visibleItems[item.id])
                          }}
                          className={`px-2 py-1 rounded text-white ${visibleItems[item.id] ? 'bg-red-500' : 'bg-green-500'}`}
                        >
                          {visibleItems[item.id] ? 'Ocultar' : 'Mostrar'}
                        </Button>
                        <span className="flex-1">{item.nombre}</span>
                        <Button
                          size="sm"
                          className="bg-amber-700 hover:bg-amber-800"
                          onClick={() => {
                            setEditMenuDia(item)
                            setShowEditMenuDiaModal(true)
                          }}
                        >
                          Editar
                        </Button>
                      </div>
                    ))}
                </div>
                {/* Añadir nuevo plato */}
                <div className="border-t pt-4 mt-4">
                  <div className="font-semibold mb-2">Añadir nuevo plato:</div>
                  <form
                    className="space-y-2"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!newDish.name || !newDish.price) return
                      try {
                        const response = await fetch("/api/admin/platos", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            nombre: newDish.name,
                            descripcion: newDish.description,
                            precio: Number(newDish.price),
                            categoria: newDish.category,
                            subcategoria: newDish.subcategory,
                          }),
                        })
                        if (!response.ok) {
                          console.error("Error al agregar plato:", response.statusText)
                          alert("Hubo un error al agregar el plato")
                          return
                        }
                        setNewDish({
                          category: menuCategories[0].key,
                          subcategory: "",
                          name: "",
                          description: "",
                          price: "",
                        })
                        fetchTodosLosPlatos()
                      } catch (error) {
                        console.error("Error de red al agregar plato:", error)
                        alert("Error de conexión al agregar plato")
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <Label>Categoría</Label>
                        <select
                          className="w-full border rounded p-2"
                          value={newDish.category}
                          onChange={e => setNewDish(d => ({ ...d, category: e.target.value, subcategory: "" }))}
                        >
                          {menuCategories.map(cat => (
                            <option key={cat.key} value={cat.key}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                      {getSubcategories(newDish.category).length > 0 && (
                        <div>
                          <Label>Subcategoría</Label>
                          <select
                            className="w-full border rounded p-2"
                            value={newDish.subcategory}
                            onChange={e => setNewDish(d => ({ ...d, subcategory: e.target.value }))}
                          >
                            <option value="">Selecciona</option>
                            {getSubcategories(newDish.category).map(subcat => (
                              <option key={subcat.key} value={subcat.key}>{subcat.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <Label>Nombre</Label>
                        <Input
                          value={newDish.name}
                          onChange={e => setNewDish(d => ({ ...d, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Precio</Label>
                        <Input
                          type="number"
                          value={newDish.price}
                          onChange={e => setNewDish(d => ({ ...d, price: e.target.value }))}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Descripción</Label>
                        <Textarea
                          value={newDish.description}
                          onChange={e => setNewDish(d => ({ ...d, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800 mt-2">
                        Añadir Plato
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
                {/* Eliminar plato */}
                <div className="border-t pt-4 mt-4">
                  <div className="font-semibold mb-2">Eliminar plato:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allDishes.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-2 mb-1">
                        <span className="flex-1">{item.nombre}</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (window.confirm(`¿Eliminar el plato "${item.nombre}"?`)) {
                              await fetch(`/api/admin/platos/${item.id}`, { method: "DELETE" })
                              fetchTodosLosPlatos()
                            }
                          }}
                        >
                          Eliminar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => {
                      setShowAdmin(false)
                      setIsPinValid(false)
                      setAdminPin("")
                    }}
                    className="bg-amber-700 hover:bg-amber-800 w-full"
                  >
                    Cerrar Panel
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Editar Menú del Día */}
      <Dialog open={showEditMenuDiaModal} onOpenChange={setShowEditMenuDiaModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Menú del Día</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editMenuDia ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editNombre">Nombre</Label>
                  <Input
                    id="editNombre"
                    value={editMenuDia.nombre}
                    onChange={(e) => setEditMenuDia({ ...editMenuDia, nombre: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editDescripcion">Descripción</Label>
                  <Textarea
                    id="editDescripcion"
                    value={editMenuDia.descripcion}
                    onChange={(e) => setEditMenuDia({ ...editMenuDia, descripcion: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="editPrecio">Precio</Label>
                  <Input
                    id="editPrecio"
                    type="number"
                    value={editMenuDia.precio}
                    onChange={(e) => setEditMenuDia({ ...editMenuDia, precio: parseFloat(e.target.value) })}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowEditMenuDiaModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={async () => {
                    try {
                      const response = await fetch(`/api/admin/platos/${editMenuDia.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          nombre: editMenuDia.nombre,
                          descripcion: editMenuDia.descripcion,
                          precio: editMenuDia.precio,
                          categoria: editMenuDia.categoria,
                        }),
                      })
                      if (!response.ok) {
                        console.error("Error al actualizar plato:", response.statusText)
                        alert("Hubo un error al actualizar el plato")
                        return
                      }
                      fetchTodosLosPlatos()
                      setShowEditMenuDiaModal(false)
                    } catch (error) {
                      console.error("Error de red al actualizar plato:", error)
                      alert("Error de conexión al actualizar plato")
                    }
                  }}>
                    Guardar Cambios
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <p>Cargando...</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ventas de Hoy */}
      <Dialog open={showVentasModal} onOpenChange={setShowVentasModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ventas de Hoy</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {ventasLoading ? (
              <p>Cargando ventas...</p>
            ) : ventasHoy ? (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Total de Ventas: ${ventasHoy.total.toLocaleString("es-CO")}</h4>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Platos Vendidos:</h5>
                  <div className="space-y-2">
                    {Object.entries(ventasHoy.platos_vendidos).map(([categoria, platos]) => (
                      <div key={categoria}>
                        <h6 className="font-medium text-gray-700">{categoria}:</h6>
                        {Object.entries(platos).map(([plato, cantidad]) => (
                          <div key={plato} className="flex justify-between text-sm ml-4">
                            <span>{plato}</span>
                            <span>{cantidad}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p>No hay datos de ventas disponibles</p>
            )}
            <DialogFooter>
              <Button onClick={() => setShowVentasModal(false)}>
                Cerrar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

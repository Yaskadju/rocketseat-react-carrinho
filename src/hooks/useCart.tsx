import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { api } from "../services/api"
import { Product, Stock } from "../types"

interface CartProviderProps {
  children: ReactNode
}

interface UpdateProductAmount {
  productId: number
  amount: number
}

interface CartContextData {
  cart: Product[]
  addProduct: (productId: number) => Promise<void>
  removeProduct: (productId: number) => void
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart")

    if (storagedCart) {
      return JSON.parse(storagedCart)
    }

    return []
  })

  const addProduct = async (productId: number) => {
    try {
      const { data: productData } = await api.get<Product>(`products/${productId}`)
      const { data: productAmountStock } = await api.get<Product>(`stock/${productId}`)

      let newCart = []
      let amount = productAmountStock.amount
      let isNewProduct = cart.every(product => product.id !== productId)

      if (isNewProduct) {
        newCart = [...cart, { ...productData, amount: 1 }]

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart))
        setCart(newCart)
      } else {
        newCart = cart.map(product => {
          if (product.id === productId) {
            if (product.amount >= amount) {
              toast.error("Quantidade solicitada fora de estoque")
              return {
                ...product
              }
            }
            return {
              ...product,
              amount: product.amount + 1
            }
          }
          return product
        })

        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart))
        setCart(newCart)
      }
    } catch {
      toast.error("Erro na adição do produto")
    }
  }

  const removeProduct = (productId: number) => {
    try {
      let updatedCart = cart.filter(product => product.id !== productId)

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
      setCart(updatedCart)
    } catch {
      toast.error("Erro na remoção do produto")
    }
  }

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      const { data: productAmountStock } = await api.get<Product>(`stock/${productId}`)
      let amountStock = productAmountStock.amount

      let newCart = cart.map(product => {
        if (productId === product.id) {
          if (product.amount >= amountStock && amount === 1) {
            toast.error("Quantidade solicitada fora de estoque")
            return {
              ...product
            }
          }

          if (product.amount <= 0) {
            return {
              ...product
            }
          }

          return {
            ...product,
            amount: product.amount + amount
          }
        }

        return product
      })

      localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart))
      setCart(newCart)
    } catch {
      toast.error("Erro na alteração de quantidade do produto")
    }
  }

  return (
    <CartContext.Provider value={{ cart, addProduct, removeProduct, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextData {
  const context = useContext(CartContext)

  return context
}

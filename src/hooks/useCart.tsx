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

  console.log({ cart })

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

        console.log("produto novo")
      } else {
        let newCart = cart.map(product => {
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

        console.log("produto já existe")
      }
    } catch {
      toast.error("Erro na adição do produto")
    }
  }

  useEffect(() => {
    console.log(cart)
  }, [])

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  }

  const updateProductAmount = async ({ productId, amount }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
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

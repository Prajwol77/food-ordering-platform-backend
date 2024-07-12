import Stripe from "stripe";
import { Request, Response } from "express";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import { Types } from "mongoose";

const stripeKey = process.env.STRIPE_API_KEY || "";
console.log(stripeKey);
const STRIPE = new Stripe(stripeKey);
const FRONTEND_URL = process.env.FRONTEND_URL as string;


const cashOnDelivery =async (req:Request, res:Response)=>{
    try {
      const checkoutSessionRequest: CheckoutSessionRequest = req.body;

      const restaurant = await Restaurant.findById(
        checkoutSessionRequest.restaurantId
      ).populate("menuItems");
  
      if (!restaurant) {
        return res.status(404).json("Restaurant not found");
      }

      let totalAmount = 0;
      checkoutSessionRequest.cartItems.map((c)=>{
        
        restaurant.menuItems.map((r)=>{
          if(r._id == new Types.ObjectId(c.id)){
            totalAmount += r.price
          }
        })
      })

  
      const newOrder = new Order({
        restaurant: restaurant,
        user: req.userId,
        status: "placed",
        deliveryDetails: checkoutSessionRequest.deliveryDetails,
        cartItems: checkoutSessionRequest.cartItems,
        estimatedDeliveryTime: checkoutSessionRequest.estimatedDeliveryTime,
        deliveryPrice: checkoutSessionRequest.deliveryPrice,
        createdAt: new Date(),
        totalAmount
      });
      newOrder.save();
      return res.status(201).json(newOrder)
   
    } catch (error) {
      console.log(error)
      res.status(500).json({ message: "Something went wrong" });
    }
}

const getMyOrders = async (req: Request, res: Response) => {
  try {
    let orders = await Order.find({ user: req.userId })
      .populate("restaurant")
      .populate("user");

    await Promise.all(
      orders.map(async (order) => {
        let totalAmount = 0;
        const restaurant = await Restaurant.findById(order.restaurant).populate(
          "menuItems"
        );

        if(!restaurant){
          return 0;
        }

        order.cartItems.forEach((cartItem) => {
          const menuItem = restaurant?.menuItems.find((m) =>
            m._id.equals(cartItem.id)
          );
          if (menuItem) {
            totalAmount += menuItem.price * cartItem.quantity;
          }
        });

        order.totalAmount = totalAmount;
        await order.save();
      })
    );

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

type CheckoutSessionRequest = {
  cartItems: {
    id: string;
    name: string;
    quantity: number;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
    city: string;
  };
  restaurantId: string;
  deliveryPrice: string;
  estimatedDeliveryTime: string;
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json("Restaurant not found");
    }

    const newOrder = new Order({
      restaurant: restaurant,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      estimatedDeliveryTime: checkoutSessionRequest.estimatedDeliveryTime,
      deliveryPrice: checkoutSessionRequest.deliveryPrice,
      createdAt: new Date(),
    });

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    console.log("checkoutSessionRequest.deliveryPrice", newOrder.deliveryPrice);

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      newOrder.deliveryPrice,
      restaurant._id.toString(),
      req.userId
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }
    await newOrder.save();
    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  //1. foreach cartItem, get the menuItem object from the restaurant
  // (to get the price)
  //2. foreach cartItem, convert it to a stripe line item
  //3. return line item array

  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find((item) => {
      const isMatch = item._id.toString() == cartItem.id.toString();
      return isMatch;
    });
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.id}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "npr",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: cartItem.quantity,
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string,
  userId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "npr",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
      userId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/restaurant/${restaurantId}?cancelled=true`,
  });
  return sessionData;
};
export { getMyOrders, createCheckoutSession, cashOnDelivery };

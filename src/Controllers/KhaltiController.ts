import axios from 'axios';
import { Request, Response } from 'express';
import Restaurant, { MenuItemType } from '../models/restaurant';
import Order from '../models/order';
// import { Restaurant, Order, MenuItemType } from './models'; 

type CartItem = {
  id: string;
  name: string;
  quantity: number;
};

type CheckoutSessionRequest = {
  cartItems: CartItem[];
  deliveryDetails: {
    email: string;
    name: string;
    address: string;
    city: string;
    contact: string;
  };
  restaurantId: string;
};

const FRONTEND_URL = process.env.FRONTEND_URL as string;

const createKhaltiLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {

  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find((item) => item._id.toString() === cartItem.id.toString());
    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.id}`);
    }

    return {
      identity: menuItem._id.toString(),
      name: menuItem.name,
      total_price: menuItem.price * cartItem.quantity * 100,
      quantity: cartItem.quantity,
      unit_price: menuItem.price * cartItem.quantity * 100,
    };
  });

  return lineItems;
};

const createKhaltiSession = async (
  lineItems: any[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string,
  checkoutSessionRequest: CheckoutSessionRequest
) => {    
  const totalAmount = lineItems.reduce((sum, item) => sum + item.total_price, 0) + deliveryPrice * 100;
    console.log(totalAmount);
    
  const options = {
    method: 'POST',
    url: 'https://a.khalti.com/api/v2/epayment/initiate/',
    headers: {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      return_url: `${FRONTEND_URL}/order-status?success=true`,
      website_url: `${FRONTEND_URL}`,
      amount: totalAmount / 100,
      purchase_order_id: orderId,
      purchase_order_name: `Order from Restaurant ${restaurantId}`,
      customer_info: {
        name: checkoutSessionRequest.deliveryDetails.name,
        email: checkoutSessionRequest.deliveryDetails.email,
        phone: checkoutSessionRequest.deliveryDetails.contact,
      },
    },
  };

  const response = await axios(options);  
  return response.data;
};

const createKhaltiCheckOutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    console.log("req.body", req.body);

    const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);

    if (!restaurant) {
      return res.status(404).json("Restaurant not found");
    }

    const lineItems = createKhaltiLineItems(checkoutSessionRequest, restaurant.menuItems);

    const newOrder = new Order({
      restaurant: restaurant._id,
      user: req.userId,
      status: "placed",
      deliveryDetails: checkoutSessionRequest.deliveryDetails,
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
    });

    await newOrder.save();

    const sessionData = await createKhaltiSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString(),
      checkoutSessionRequest
    );

    return res.status(200).json(sessionData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createKhaltiCheckOutSession;

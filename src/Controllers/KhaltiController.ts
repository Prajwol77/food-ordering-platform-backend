import axios from 'axios';
import { Request, Response } from 'express';
import Restaurant, { MenuItemType } from '../models/restaurant';
import Order from '../models/order';

type CartItem = {
  id: string;
  name: string;
  quantity: number;
};

type DeliveryDetails = {
  email: string;
  name: string;
  address: string;
  city: string;
  contact: string;
};

type CheckoutSessionRequest = {
  cartItems: CartItem[];
  deliveryDetails: DeliveryDetails;
  restaurantId: string;
  deliveryPrice: string;
  estimatedDeliveryTime: string;
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
      total_price: menuItem.price * cartItem.quantity / 100,
      quantity: cartItem.quantity,
      unit_price: menuItem.price * cartItem.quantity / 100,
    };
  });

  console.log("lineItems", lineItems);
  return lineItems;
};

const createKhaltiSession = async (
  lineItems: any[],
  orderId: string,
  deliveryPrice: string,
  restaurantId: string,
  checkoutSessionRequest: CheckoutSessionRequest
) => {    
  const totalAmount: number = lineItems.reduce((sum, item) => sum + item.total_price, 0) + (parseInt(deliveryPrice));
  console.log('totalAmount', totalAmount);
  
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
      amount: totalAmount * 100,
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
  console.log(response.data);
  
  return response.data;
};

const createKhaltiCheckOutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;
    const { estimatedDeliveryTime, deliveryPrice } = checkoutSessionRequest;

    console.log("req.body", req.body);

    if (!estimatedDeliveryTime || !deliveryPrice) {
      return res.status(400).json({ message: 'estimatedDeliveryTime and deliveryPrice are required' });
    }

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
      deliveryPrice: parseFloat(deliveryPrice),
      estimatedDeliveryTime: parseInt(estimatedDeliveryTime),
    });

    await newOrder.save();

    const session = await createKhaltiSession(
      lineItems,
      newOrder._id.toString(),
      deliveryPrice,
      restaurant._id.toString(),
      checkoutSessionRequest
    );

    return res.status(200).json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export default createKhaltiCheckOutSession;

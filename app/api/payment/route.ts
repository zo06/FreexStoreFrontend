import { NextResponse } from 'next/server';

interface PaymentData {
  name: string;
  email: string;
  amount: number;
  orderID: string;
  scriptId?: string;
  licenseType?: string;
}

export async function POST(request: Request) {
  try {
    const data: PaymentData = await request.json();
    console.log('Received payment data:', data);
        
    // Forward the request directly to our NestJS backend
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/payment/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify(data)
    });

    const backendData = await backendResponse.json();
    console.log('Backend processing response:', backendData);

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: backendData.message || 'Payment processing failed' },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(backendData, { status: 200 });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Forward the request to our NestJS backend
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/payment`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const backendData = await backendResponse.json();
    return NextResponse.json(backendData, { status: backendResponse.status });
  } catch (error) {
    console.error('Payment info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

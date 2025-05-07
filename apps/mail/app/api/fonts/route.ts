import { getServerSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch from Google Fonts API
    // Note: In a production environment, you would use an API key
    // For this implementation, we'll use a subset of popular fonts
    const popularFonts = [
      { family: 'Roboto' },
      { family: 'Open Sans' },
      { family: 'Lato' },
      { family: 'Montserrat' },
      { family: 'Roboto Condensed' },
      { family: 'Source Sans Pro' },
      { family: 'Oswald' },
      { family: 'Raleway' },
      { family: 'Ubuntu' },
      { family: 'Merriweather' },
      { family: 'Playfair Display' },
      { family: 'Poppins' },
      { family: 'Nunito' },
      { family: 'Rubik' },
      { family: 'Work Sans' },
      { family: 'PT Sans' },
      { family: 'Noto Sans' },
      { family: 'Inter' },
      { family: 'Quicksand' },
      { family: 'Fira Sans' },
      { family: 'Mulish' },
      { family: 'Nunito Sans' },
      { family: 'Cabin' },
      { family: 'Karla' },
      { family: 'Josefin Sans' },
      { family: 'DM Sans' },
      { family: 'Arimo' },
      { family: 'Barlow' },
      { family: 'Libre Franklin' },
      { family: 'Manrope' },
    ];
    
    return NextResponse.json(popularFonts);
  } catch (error) {
    console.error('Error fetching fonts:', error);
    return NextResponse.json({ error: 'Failed to fetch fonts' }, { status: 500 });
  }
}
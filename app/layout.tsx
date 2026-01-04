import './globals.css'; import type { Metadata } from 'next';
export const metadata: Metadata = { title:'Fitness Výzva', description:'Fitness výzva – denní záznamy, dashboard a žebříček.', manifest:'/manifest.json', themeColor:'#10b981' };
export default function RootLayout({children}:{children:React.ReactNode}){return(<html lang="cs"><body>{children}</body></html>);}

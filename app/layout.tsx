import './global.css'

export const metadata = {
    title: 'F1GPT',
    description: 'F1GPT',
}

const RootLayout = ({ children }) => {
    return (
        <html lang='en'>
            <body>
                {children}
            </body>
        </html>
    )
}

export default RootLayout
/**
 * This code was generated by v0 by Vercel.
 * @see https://v0.dev/t/5oWHGLcu06z
 */
import { Button } from "@/components/ui/button"

export function FirstA() {
  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto p-4 md:p-6">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Mint your own NFTs on multiple blockchains</h1>
        <p className="text-gray-500 md:w-[85%] dark:text-gray-400">
          Connect your wallet, upload your artwork, set a price, and mint your NFTs on Solana, Ethereum, Aptos, and Flow
          blockchains. Supported file formats: JPEG, PNG, GIF, MP4, GLB.
        </p>
      </div>
      <div className="flex items-start md:justify-end space-x-2 md:space-x-4">
        <Button size="lg">Connect Wallet</Button>
      </div>
    </div>
  )
}

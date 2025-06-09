import Product from "@/app/(modules)/product/components/product";

export default function Home() {
    return (
        <div className="container mx-auto flex gap-3">
            <div className="basis-3/12">
                <Product name={'test'} imageUrl={'/images/product.png'} price={100} rating={199} reviews={100}/>
            </div>
            <div className="basis-3/12">
                <Product name={'test'} imageUrl={'/images/product.png'} price={100} rating={199} reviews={100}/>
            </div>
            <div className="basis-3/12">
                <Product name={'test'} imageUrl={'/images/product.png'} price={100} rating={199} reviews={100}/>
            </div>
            <div className="basis-3/12">
                <Product name={'test'} imageUrl={'/images/product.png'} price={100} rating={199} reviews={100}/>
            </div>
            <div className="basis-3/12">
                <Product name={'test'} imageUrl={'/images/product.png'} price={100} rating={199} reviews={100}/>
            </div>
        </div>
    );
}

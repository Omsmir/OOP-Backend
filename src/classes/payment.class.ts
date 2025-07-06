

interface Refundable {
    refund():void
}


abstract class Payment {
    constructor(protected balance: number) {}
     abstract pay(amount:number): void;
}
 class PayWithCredit extends Payment implements Refundable {
 
    public pay(amount:number): void {
        if(amount > this.balance) throw new Error("there is no enough fund in your current balance")
        this.balance -= amount

    }
    public refund(): void {
        
    }
    public getBalance(){

        return this.balance
    }
    
}


const omarBalance = new PayWithCredit(1000)


console.log(omarBalance.getBalance())

omarBalance.pay(1244)

console.log(omarBalance.getBalance())


// Strategy interfaces
interface PaymentStrategy {
    pay(amount: number): void;
  }
  
  // Concrete strategies
  class CreditCardPayment implements PaymentStrategy {
    pay(amount: number) {
      console.log(`Paid $${amount} using Credit Card`);
    }
  }
  
  class PayPalPayment implements PaymentStrategy {
    pay(amount: number) {
      console.log(`Paid $${amount} using PayPal`);
    }
  }
  
  // Context (uses strategy)
  class PaymentProcessor {
    constructor(private strategy: PaymentStrategy) {}
  
    process(amount: number) {
      this.strategy.pay(amount);
    }
  }
  
  // Usage
  const paypal = new PaymentProcessor(new PayPalPayment());
  paypal.process(200); // Paid $200 using PayPal
  
  const card = new PaymentProcessor(new CreditCardPayment());
  card.process(100); // Paid $100 using Credit Card
  



export default PayWithCredit
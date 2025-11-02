import { gqlClient } from "@/core/connection/apollo-client";
import { gql } from "@apollo/client";

const data = {
    "data": {
        "glossaries": [
            {
                "Title": "Allotment",
                "Explanation": "Allotment means the process of distributing bonds to investors when they are available for purchase in a public offering. It decides how many bonds each investor will get based on the total demand and availability."
            },
            {
                "Title": "Annuity",
                "Explanation": "An annuity is a financial plan that provides regular payments at fixed intervals, such as monthly or yearly."
            },
            {
                "Title": "Amortization",
                "Explanation": "Amortization means gradually paying off a loan by making regular payments over time."
            },
            {
                "Title": "American Option",
                "Explanation": "An American option is a type of financial contract that allows the buyer to use their right to buy or sell at any time before the expiry date."
            },
            {
                "Title": "Appreciation",
                "Explanation": "Appreciation is the increase in the value of an asset over time."
            },
            {
                "Title": "Arbitrage",
                "Explanation": "Arbitrage is the practice of buying an asset in one market at a lower price and selling it in another market at a higher price to earn a profit without risk."
            },
            {
                "Title": "Arbitrageur",
                "Explanation": "An arbitrageur is a person who makes money by taking advantage of price differences of the same asset in different markets."
            },
            {
                "Title": "ASBA (Applications Supported by Blocked Amount)",
                "Explanation": "ASBA is a process used when applying for shares or bonds in a public issue. The investor’s bank account is temporarily blocked for the applied amount, but the money is deducted only after the shares or bonds are allotted."
            },
            {
                "Title": "Ask Price",
                "Explanation": "Ask price is the price at which a seller is willing to sell a security (such as a stock or bond)."
            },
            {
                "Title": "Asset",
                "Explanation": "An asset is anything valuable that a person, company, or organization owns, which can provide financial benefits in the future. Examples include money, property, and stocks."
            },
            {
                "Title": "AT1 Bonds (Additional Tier 1 Bonds)",
                "Explanation": "AT1 bonds are special bonds issued by banks. They can be converted into shares or written off if the bank faces financial trouble to help strengthen its financial position."
            },
            {
                "Title": "Asset Allocation",
                "Explanation": "Asset allocation is the process of spreading investments across different types of assets, such as stocks, bonds, and gold. This helps reduce risk and achieve financial goals."
            },
            {
                "Title": "Asset-Backed Security (ABS)",
                "Explanation": "An Asset-Backed Security (ABS) is a financial product backed by cash flows from a group of assets like loans, leases, or receivables."
            },
            {
                "Title": "Asset & Liability Management (ALM)",
                "Explanation": "Asset & Liability Management (ALM) is a strategy used by banks and financial institutions to balance their assets (money they own) and liabilities (money they owe) to minimize risks and improve profits."
            },
            {
                "Title": "Asset Securitization",
                "Explanation": "Asset securitization is the process of bundling different types of loans or debt and turning them into securities that investors can buy."
            },
            {
                "Title": "Asset Swap",
                "Explanation": "An asset swap is when an investor exchanges the interest payments of one investment (like a bond) for the interest payments of another (like a loan)."
            },
            {
                "Title": "Auction",
                "Explanation": "An auction is a way of selling securities where buyers place bids, and the highest bidder gets the securities at the final price."
            },
            {
                "Title": "Asset Class",
                "Explanation": "An asset class is a group of similar investments that behave in the same way in the market. Examples include stocks, bonds, real estate, and commodities. Investing in different asset classes helps manage risk and grow wealth."
            },
            {
                "Title": "At-the-Money (ATM)",
                "Explanation": "An option is called \"At-the-Money\" (ATM) when its strike price is the same as the current market price of the asset."
            },
            {
                "Title": "Baklava Bond",
                "Explanation": "Baklava bonds are bonds issued by foreign companies in Turkey, but they are priced in Turkish Lira."
            },
            {
                "Title": "Available For Sale (AFS)",
                "Explanation": "Available For Sale (AFS) refers to financial assets that are not meant for immediate trading but can be sold when needed."
            },
            {
                "Title": "Bank for International Settlements (BIS)",
                "Explanation": "The Bank for International Settlements (BIS) is an international financial organization owned by central banks. It helps central banks work together and supports global financial stability."
            },
            {
                "Title": "Bank Bonds",
                "Explanation": "Bank bonds are debt instruments issued by banks to raise money. Investors who buy these bonds receive regular interest payments and get back the full amount when the bond matures."
            },
            {
                "Title": "Barbell Position",
                "Explanation": "A barbell position is an investment strategy where an investor holds both short-term and long-term securities while avoiding medium-term securities."
            },
            {
                "Title": "Base Issue",
                "Explanation": "The base issue is the total number of bonds a company or government offers for sale in a public bond issuance."
            },
            {
                "Title": "Base Yield Curve",
                "Explanation": "A base yield curve is a graph showing the relationship between bond yields (returns) and their maturity periods for bonds with similar credit ratings."
            },
            {
                "Title": "Basis Swap",
                "Explanation": "A basis swap is a financial agreement where two parties exchange interest rate payments based on different floating rates. It helps manage risks related to changing interest rates."
            },
            {
                "Title": "Basis Risk",
                "Explanation": "Basis risk is the risk that a financial hedge (a protection strategy) will not perfectly match the movement of the asset it is meant to protect, leading to possible financial losses."
            },
            {
                "Title": "Benchmark Bond",
                "Explanation": "A benchmark bond is a widely used, low-risk bond that serves as a reference for pricing other bonds in the market."
            },
            {
                "Title": "Benchmark Rate",
                "Explanation": "A benchmark rate is a standard interest rate that is used as a reference for setting rates on loans and other financial products."
            },
            {
                "Title": "Bid-Ask Spread",
                "Explanation": "The bid-ask spread is the difference between the highest price a buyer is willing to pay for a security (bid price) and the lowest price a seller is willing to accept (ask price). It represents the transaction cost and market liquidity."
            },
            {
                "Title": "Bid Price",
                "Explanation": "The bid price is the price a buyer is willing to pay for a security, such as a stock or bond."
            },
            {
                "Title": "Bilateral Netting",
                "Explanation": "Bilateral netting is an agreement between two parties to combine multiple financial transactions into a single payment. This reduces the number of transactions, lowers costs, and minimizes credit risk."
            },
            {
                "Title": "Binomial Tree",
                "Explanation": "A binomial tree is a diagram used in financial models to show different possible future prices of an asset, often used in option pricing. It works like a decision tree showing different outcomes."
            },
            {
                "Title": "Black-Scholes Model",
                "Explanation": "The Black-Scholes model is a mathematical formula used to determine the fair price of options. It considers factors like the asset's price, expiration time, market volatility, and interest rates."
            },
            {
                "Title": "Bombay Stock Exchange (BSE)",
                "Explanation": "The Bombay Stock Exchange (BSE) is India's oldest stock exchange where stocks, bonds, and other financial instruments are traded."
            },
            {
                "Title": "Bond Calculator",
                "Explanation": "A bond calculator is a tool that helps investors calculate different aspects of a bond, such as its price, yield, interest payments, and return at maturity."
            },
            {
                "Title": "Bond",
                "Explanation": "A bond is a financial instrument where investors lend money to a company or government in exchange for regular interest payments and repayment of the amount borrowed at a fixed date."
            },
            {
                "Title": "Bond Equivalent Yield (BEY)",
                "Explanation": "Bond equivalent yield (BEY) is a calculation that converts different types of bond yields into an annualized format, making it easier to compare bonds with different interest payment schedules."
            },
            {
                "Title": "Bond Directory",
                "Explanation": "A bond directory is a list of available bonds in the market along with their details, such as prices, interest rates, and maturity dates. It helps investors compare and choose bonds."
            },
            {
                "Title": "Bondholder",
                "Explanation": "A bondholder is an investor who owns a bond. They receive regular interest payments and get back the principal amount when the bond matures."
            },
            {
                "Title": "Calendar Spread",
                "Explanation": "This is a trading strategy where an investor buys and sells two options (financial contracts) with the same price but different expiry dates. The goal is to make a profit from how the value of these options changes over time."
            },
            {
                "Title": "Callable Bond",
                "Explanation": "A bond where the company or government that issued it can repay the full amount before the agreed maturity date. This usually happens when interest rates fall, allowing them to borrow money at a lower cost."
            },
            {
                "Title": "Call Date",
                "Explanation": "The specific date when the issuer of a callable bond can pay back the bond before its maturity."
            },
            {
                "Title": "Call Price",
                "Explanation": "The price at which the issuer of a callable bond can buy back the bond before maturity."
            },
            {
                "Title": "Call Option",
                "Explanation": "A contract that gives the buyer the right (but not the obligation) to buy a financial asset at a fixed price before a certain date."
            },
            {
                "Title": "Call Risk",
                "Explanation": "The risk that a bond will be paid back early by the issuer, especially when interest rates go down. This can be a problem for investors because they may have to reinvest at lower interest rates."
            },
            {
                "Title": "Cap",
                "Explanation": "The maximum limit on the interest rate of a financial product like a bond, loan, or mortgage."
            },
            {
                "Title": "Capital Adequacy",
                "Explanation": "This refers to the financial strength of a bank or financial institution. It shows if the bank has enough money (capital) to cover losses and stay stable."
            },
            {
                "Title": "Capital Gain Bonds",
                "Explanation": "These bonds (also called 54EC bonds) help investors save tax on profits earned from selling land, property, or other assets. They are issued by government-backed organizations."
            },
            {
                "Title": "Capital Gains Tax",
                "Explanation": "The tax you have to pay on the profit made when selling an asset like property, shares, or gold."
            },
            {
                "Title": "Capital Indexed Bonds",
                "Explanation": "These are bonds where the principal amount increases with inflation, protecting investors from rising prices."
            },
            {
                "Title": "Carry",
                "Explanation": "The profit or loss from holding a financial asset like a bond or foreign currency for some time. It includes interest, dividends, or other earnings."
            },
            {
                "Title": "Capital Market",
                "Explanation": "The place where people buy and sell long-term financial products like shares and bonds. It helps businesses and the government raise money from investors."
            },
            {
                "Title": "Cash-and-Carry Arbitrage",
                "Explanation": "A strategy where an investor buys an asset and sells a related future contract to make a profit from the price difference."
            },
            {
                "Title": "Cash Management Bills",
                "Explanation": "Short-term loans taken by the government to manage its cash needs. These loans usually last for less than 91 days."
            },
            {
                "Title": "Cash Flow",
                "Explanation": "The movement of money in and out of a business. It includes money earned (sales, investments) and money spent (expenses, loan payments)."
            },
            {
                "Title": "Cash Reserve Ratio (CRR)",
                "Explanation": "The percentage of money that banks must keep as reserves with the Reserve Bank of India (RBI). It helps control inflation and manage the money supply in the economy."
            },
            {
                "Title": "Cheapest to Deliver (CTD)",
                "Explanation": "The least expensive bond that can be delivered to complete a bond futures contract."
            },
            {
                "Title": "Clean Price",
                "Explanation": "The price of a bond without adding the interest that has already been earned."
            },
            {
                "Title": "Certificate of Deposit (CD)",
                "Explanation": "A savings option provided by banks where people can deposit money for a fixed period (like 1 to 3 years) and earn a fixed interest."
            },
            {
                "Title": "Climate Bonds",
                "Explanation": "Bonds issued to raise money for projects that help fight climate change, such as renewable energy, pollution control, and sustainable infrastructure."
            },
            {
                "Title": "Collar",
                "Explanation": "A risk-management strategy where an investor limits both potential losses and profits by using a combination of options."
            },
            {
                "Title": "Clearing Corporation of India Limited (CCIL)",
                "Explanation": "An organization in India that ensures smooth trading of bonds, currencies, and derivatives. It acts as a middleman to reduce risks in financial transactions."
            },
            {
                "Title": "Collateralized Debt Obligation (CDO)",
                "Explanation": "A financial product that pools together different types of debt (such as home loans and corporate loans) and sells them as investment products. The risk and return depend on the type of debt included."
            },
            {
                "Title": "Collateral Trust Bond",
                "Explanation": "This is a type of bond where the company gives other financial assets (like shares, bonds, or securities) as a guarantee (security) to protect the investor. If the company fails to repay, these assets can be sold to return money to the investor."
            },
            {
                "Title": "Collateralized Mortgage Obligation (CMO)",
                "Explanation": "This is a type of financial product made by combining many home loans into one big package. This big package is then broken into smaller parts (called tranches) that investors can buy. Each part has different levels of risk and returns, so investors can choose according to their comfort."
            },
            {
                "Title": "Commercial Paper",
                "Explanation": "Commercial paper is a type of short-term loan that big companies or banks take to manage their daily expenses. It is usually repaid within a year. It is not backed by anything, so it depends only on the company’s reputation and financial strength."
            },
            {
                "Title": "Compound Interest",
                "Explanation": "Compound interest means earning interest not just on your original money (principal), but also on the interest you have already earned. This way, your money grows faster over time."
            },
            {
                "Title": "Contango",
                "Explanation": "This happens in some markets where future prices (price for delivery later) are higher than today’s prices. It usually means people expect prices to rise in the future."
            },
            {
                "Title": "Competitive Bid",
                "Explanation": "This is when an investor offers a price to buy bonds or securities in a public auction. The investor tries to buy at the best possible price."
            },
            {
                "Title": "Consumer Price Index (CPI)",
                "Explanation": "CPI shows how prices of daily-use items (like food, fuel, clothes, etc.) change over time. It helps understand how expensive things are becoming, which is called inflation."
            },
            {
                "Title": "Concave Yield Curve",
                "Explanation": "This is a chart that shows how much return (interest) you will get from bonds based on how long you hold them. In this case, bonds with longer time periods give lower interest compared to short-term bonds."
            },
            {
                "Title": "Contingent Convertible Bonds (CoCo Bonds)",
                "Explanation": "These are special bonds that can change into company shares if a particular event happens, like the company getting into financial trouble."
            },
            {
                "Title": "Convertible Bonds",
                "Explanation": "These are special bonds that can be changed into company shares if the investor wants. The company and the investor decide in advance how many shares the investor will get for each bond."
            },
            {
                "Title": "Convertible Bond Arbitrage",
                "Explanation": "This is a smart trading trick where investors buy a convertible bond and at the same time sell the company’s shares. The goal is to make a profit from small price differences between the bond and the shares."
            },
            {
                "Title": "Convexity Adjustments",
                "Explanation": "This is a small correction made to the price or interest rate of a bond. This correction is needed because bond prices do not change in a straight line when interest rates go up or down. The change is curved (convex), so the adjustment helps to show the correct price."
            },
            {
                "Title": "Convexity",
                "Explanation": "This is a concept that helps investors understand how much a bond’s price will change if interest rates go up or down. It gives a better picture than just using the bond’s duration (time left till maturity)."
            },
            {
                "Title": "Convex Yield Curve",
                "Explanation": "This is a chart that shows how much interest (yield) you will get on bonds with different time periods. In this type of curve, longer-term bonds give higher interest than short-term bonds, but the increase in interest slows down after some time. The curve looks like a gentle upward bend."
            },
            {
                "Title": "Corporate Bonds",
                "Explanation": "These are bonds issued by companies to borrow money from the public. When you buy a corporate bond, you are lending money to the company. In return, the company pays you regular interest, and after the bond period ends, you get back the full amount you invested."
            },
            {
                "Title": "Correlation",
                "Explanation": "Correlation shows how two investments move compared to each other. If both investments move in the same direction (both go up or both go down), they have high correlation. If they move in opposite directions, they have low or negative correlation."
            },
            {
                "Title": "Cost of Carry",
                "Explanation": "This is the total cost of holding a bond or any other investment for a period of time. It includes costs like interest you pay if you borrowed money to buy the bond, storage charges (in case of physical goods), and the income you lose by keeping money locked in that investment."
            },
            {
                "Title": "Coupon Rate",
                "Explanation": "This is the fixed interest rate that the bond pays to the investor. It is a percentage of the bond’s original price (face value). For example, if a ₹1000 bond has a 7% coupon rate, you will get ₹70 interest every year."
            },
            {
                "Title": "Coupon Equivalent Yield (CEY)",
                "Explanation": "This is a special way to calculate the return on bonds that do not pay regular interest (like zero-coupon bonds). CEY helps compare such bonds with normal bonds that pay regular interest."
            },
            {
                "Title": "Covenant",
                "Explanation": "A covenant is a promise or condition written in the bond agreement. It lists rules that the company must follow after issuing the bond. For example, a company may promise not to take too many new loans until it repays the bondholders."
            },
            {
                "Title": "Credit Derivatives",
                "Explanation": "These are financial products that allow investors to protect themselves from the risk that a company or government might not repay its loans (default). Investors can also use these products to bet on changes in credit quality, like betting that a company’s credit rating will go down."
            },
            {
                "Title": "Credit Enhancement",
                "Explanation": "This is a way to make a bond safer for investors. The company issuing the bond might add extra safety measures, like offering a guarantee, adding insurance, or giving extra property as security. This makes investors feel more confident that they will get their money back."
            },
            {
                "Title": "Credit Event",
                "Explanation": "This is a serious problem with the company that issued the bond — like bankruptcy, missing an interest payment, or getting a very bad credit rating. When such an event happens, it means the risk of losing money on that bond becomes much higher."
            },
            {
                "Title": "Credit Rating",
                "Explanation": "Credit rating is a grade given to companies, governments, or bonds to show how safe or risky they are for investors. High credit rating means very safe (like school grades – ‘AAA’ is top grade), and low credit rating means risky (like ‘D’, which shows danger of default)"
            },
            {
                "Title": "Credit Rating Agencies",
                "Explanation": "These are companies that check how strong and trustworthy a company or government is when it comes to repaying loans. They give ratings (like marks in school – AAA, AA, A, etc.) to show how safe or risky it is to invest in their bonds. Higher rating means safer investment. Lower rating means more risky."
            },
            {
                "Title": "Credit Risk",
                "Explanation": "This is the risk that the company or government who took money from investors might not be able to pay back the money or interest on time. Higher credit risk means there is more chance of losing money."
            },
            {
                "Title": "Current Yield",
                "Explanation": "This is the yearly interest you earn from a bond, shown as a percentage of the bond’s current market price. If the bond price goes down, the current yield goes up — and if the bond price goes up, the current yield goes down."
            },
            {
                "Title": "Credit Spread",
                "Explanation": "This is the difference in interest rates between two bonds – one safe and one risky – with the same time period. The riskier bond pays higher interest to attract investors. This extra interest is called the \"credit spread.\""
            },
            {
                "Title": "Cross Hedge",
                "Explanation": "This is a smart way to reduce risk by using another financial product, even if it’s not directly connected. For example, if you are worried about the price of oil going up, you might invest in something related to oil, like energy company shares, to balance the risk."
            },
            {
                "Title": "Curvature Risk",
                "Explanation": "This is the risk that the bond’s price may change unexpectedly if the shape of the \"yield curve\" (a chart showing interest rates for bonds of different lengths) changes. This is important for advanced bond traders but not a big concern for small investors."
            },
            {
                "Title": "Day Count",
                "Explanation": "This is a simple method used to count the number of days between two dates. It helps to calculate the interest earned on a bond during that time."
            },
            {
                "Title": "Custodian",
                "Explanation": "A custodian is a trusted company (usually a bank) that keeps your bonds, shares, or other investments safe. They do not own the investments, but they take care of them for you — like a bank locker for your financial assets. ."
            },
            {
                "Title": "Dealer",
                "Explanation": "A dealer is a person or company that buys and sells financial products like bonds, shares, and gold. They do this either to make profit for themselves or to help their clients."
            },
            {
                "Title": "Debenture",
                "Explanation": "A debenture is a type of loan taken by a company from the public. When you buy a debenture, you are giving a loan to the company. In return, the company pays you interest and returns your money after a fixed time."
            },
            {
                "Title": "Debenture Holder",
                "Explanation": "If you buy a debenture, you are called a debenture holder. This means you are lending money to the company, and the company must pay you interest and return your money at the end."
            },
            {
                "Title": "Debenture Trustee",
                "Explanation": "A debenture trustee is a third party (like a bank or financial institution) that takes care of debenture holders' rights. The trustee makes sure the company follows all rules and pays interest and principal properly."
            },
            {
                "Title": "Deep Discount Bond",
                "Explanation": "This is a special type of bond sold at a very low price compared to its final value. You don’t get regular interest. Instead, after many years, you get a higher amount, which includes both your investment and profit."
            },
            {
                "Title": "Debt",
                "Explanation": "Debt means borrowing money. When a person, company, or government takes money as a loan, it is called debt. They have to repay this money, usually with interest, after some time."
            },
            {
                "Title": "Debt Service Coverage",
                "Explanation": "This is a simple way to check if a company is earning enough money to pay its loan installments (both principal and interest). It shows how comfortable the company is in managing its debt."
            },
            {
                "Title": "Default",
                "Explanation": "Default happens when a company or government fails to pay back the loan or interest on time, as promised."
            },
            {
                "Title": "Default Risk",
                "Explanation": "Default risk means the chance that the company or government might fail to pay interest or return your money. Higher risk means a greater chance of losing money."
            },
            {
                "Title": "Deliverable Bond",
                "Explanation": "This is a bond that can be used to complete a futures contract. In simple words, if a trader has promised to deliver bonds in the future, they can use this type of bond to fulfill that promise. ."
            },
            {
                "Title": "Delta",
                "Explanation": "Delta shows how much the price of an option changes when the price of the related stock or bond changes. For example, if a stock price goes up by ₹10, delta tells you how much the option price will go up or down."
            },
            {
                "Title": "Deferred Interest Bond",
                "Explanation": "This is a type of bond where the company does not pay you regular interest at first. Instead, all the interest is added up and paid to you later, along with the regular payments that start after a few years."
            },
            {
                "Title": "Derivative Securities",
                "Explanation": "These are special financial contracts whose value comes from another thing — like a stock, gold, oil, or bond. Examples are futures, options, and swaps. People use these to protect their money from risk or to make extra profits by guessing price changes."
            },
            {
                "Title": "Delivery versus Payment (DvP)",
                "Explanation": "This is a safe way to settle buying and selling of bonds or shares. In DvP, both payment and delivery happen together — meaning you get the bond only if you pay the money, and the seller gets the money only if they deliver the bond. This makes sure no one cheats."
            },
            {
                "Title": "Demat",
                "Explanation": "Demat (short for dematerialization) means keeping your shares and bonds in electronic form instead of paper certificates. A Demat account is like a digital locker where all your shares and bonds are kept safely."
            },
            {
                "Title": "Dim Sum Bonds",
                "Explanation": "These are bonds issued outside China but in Chinese currency (Renminbi). They are mainly used by international investors who want to invest in China’s currency."
            },
            {
                "Title": "Dirty Price",
                "Explanation": "This is the total price you pay when buying a bond. It includes the actual bond price plus the interest that has already been earned since the last interest payment."
            },
            {
                "Title": "Discount Bond",
                "Explanation": "This is a bond sold at a lower price than its face value. For example, a ₹1000 bond might be sold for ₹900. This happens if the bond pays very low or no regular interest (coupon)."
            },
            {
                "Title": "Discount Rate",
                "Explanation": "This is the rate used to calculate today’s value of future cash flows. It helps to find out how much future income is worth today."
            },
            {
                "Title": "Discounted Cash Flow (DCF)",
                "Explanation": "This is a method used to calculate how much an investment is worth today based on the money it is expected to earn in the future. DCF also reduces future cash flows to today’s value because money today is worth more than money in the future."
            },
            {
                "Title": "Dual Currency Bonds",
                "Explanation": "These are bonds where money is collected in one currency, but the interest and repayment are made in a different currency. For example, a bond may be issued in Japan (in Yen), but interest and final payment are made in US Dollars."
            },
            {
                "Title": "Downgrade Risk",
                "Explanation": "This is the risk that a company’s bond will get a lower credit rating if the company’s financial health gets worse. If the rating is downgraded, the bond price may fall, and it becomes harder for the company to borrow money."
            },
            {
                "Title": "Duration (Macaulay Duration)",
                "Explanation": "Duration tells how sensitive a bond’s price is to changes in interest rates. It is also the average time (in years) you will wait to get back all your money from the bond, including interest and principal repayment."
            },
            {
                "Title": "Duration Matching",
                "Explanation": "This is a method used by big investors (like banks or insurance companies) to manage risk. In this method, they make sure that the money they will get from their investments (assets) comes at the same time they need to pay their loans or other payments (liabilities). This way, they don’t face problems if interest rates change."
            },
            {
                "Title": "Effective Duration",
                "Explanation": "This shows how much the price of a bond can change if interest rates go up or down. It also considers any special features in the bond — like if the company can repay early (call option) — that might affect the cash flows you get."
            },
            {
                "Title": "E-Kuber",
                "Explanation": "E-Kuber is the online banking system of the Reserve Bank of India (RBI). Through this system, RBI manages banking and money-related work with all banks in India."
            },
            {
                "Title": "Emerging Markets Bond Index (EMBI)",
                "Explanation": "This is a list that tracks the performance of bonds issued by governments and companies in developing countries (like India, Brazil, or Indonesia). It helps investors understand how well these bonds are doing."
            },
            {
                "Title": "Equity",
                "Explanation": "Equity means ownership in a company. If you buy shares of a company, you become a part-owner. Equity owners share profits if the company does well, but also face losses if the company does badly."
            },
            {
                "Title": "Embedded Option",
                "Explanation": "This is a special feature inside some bonds or financial products. It allows the company or the investor to do something extra — like repay early (call option) or sell back the bond (put option). These features can change the bond’s value."
            },
            {
                "Title": "Eurobond",
                "Explanation": "A Eurobond is a bond issued in a different currency than the country it is sold in. For example, a bond issued in Japan, but in US Dollars."
            },
            {
                "Title": "European Option",
                "Explanation": "This is a type of financial contract that can only be used (exercised) on the final expiry date — not before that."
            },
            {
                "Title": "Event Risk",
                "Explanation": "This is the risk that a big unexpected event (like war, natural disaster, new government rule, or company fraud) can suddenly reduce the value of your investments."
            },
            {
                "Title": "External Commercial Borrowings (ECBs)",
                "Explanation": "This means loans taken by Indian companies from banks or lenders outside India, in foreign currency. Indian companies use this money for big projects like factories, machines, or expansion."
            },
            {
                "Title": "FIMMDA",
                "Explanation": "FIMMDA is a group in India that looks after the rules and smooth working of the bond market, money market, and derivatives market. They help in deciding standard rates, rules, and best ways to trade in these markets."
            },
            {
                "Title": "Extrapolation",
                "Explanation": "Extrapolation means guessing future numbers by looking at old numbers and trends. For example, if a company’s sales are increasing every year by 10%, we may assume the same trend will continue and predict next year’s sales using extrapolation."
            },
            {
                "Title": "Financial Benchmark India Limited (FBIL)",
                "Explanation": "FBIL is a company that calculates and manages important financial numbers called benchmarks in India. These benchmarks are used to decide interest rates, bond prices, and other important things in financial markets."
            },
            {
                "Title": "Extendible Bond",
                "Explanation": "This is a bond where the investor can extend the time period of the bond if they want. For example, if the bond is for 5 years, the investor may choose to extend it for another 3 years."
            },
            {
                "Title": "Fixed Rate Bonds",
                "Explanation": "These are simple bonds where the interest rate is fixed when you buy the bond. This rate does not change until the bond matures, so you know exactly how much interest you will get every year."
            },
            {
                "Title": "Flight to Quality",
                "Explanation": "This happens when investors move their money from risky investments (like company shares) to safe investments (like government bonds) during times of fear or uncertainty."
            },
            {
                "Title": "Floor",
                "Explanation": "Floor means the minimum price or minimum value that something (like a bond or stock) can fall to. It protects investors from very big losses."
            },
            {
                "Title": "Floating Rate Bonds",
                "Explanation": "These are bonds where the interest rate changes from time to time based on a set formula, usually linked to some market rate like RBI’s repo rate."
            },
            {
                "Title": "Foreign Bonds",
                "Explanation": "These are bonds issued by a company from another country, but in the currency of the country where they are sold. For example, if a US company sells bonds in India in rupees, that is a foreign bond."
            },
            {
                "Title": "Foreign Currency Convertible Bonds (FCCB)",
                "Explanation": "These are bonds issued by an Indian company in a foreign currency (like US dollars). Later, these bonds can be converted into shares of the company if the investor wants."
            },
            {
                "Title": "Foreign Portfolio Investor (FPI)",
                "Explanation": "These are foreign investors (big or small) who invest in India’s stock market, bond market, or other financial markets. They invest money to earn profit, but they are not involved in running the companies they invest in."
            },
            {
                "Title": "Foreign Institutional Investors (FIIs)",
                "Explanation": "These are big foreign investors like international banks, insurance companies, or large funds that invest in Indian markets — in shares, bonds, or other financial products."
            },
            {
                "Title": "Forward Contracts",
                "Explanation": "This is a private agreement between two people or companies to buy or sell something at a fixed price on a future date. Forward contracts are often used to fix the price in advance to avoid risks if prices change later."
            },
            {
                "Title": "Forward Price",
                "Explanation": "This is the price decided today for buying or selling something on a future date under a forward contract."
            },
            {
                "Title": "Forward Rate Agreement (FRA)",
                "Explanation": "This is a special financial contract where two parties fix an interest rate for a future date. It helps protect against interest rates going up or down unexpectedly."
            },
            {
                "Title": "Forward Rates of Interest",
                "Explanation": "These are the future interest rates that people expect based on today’s market conditions and forward agreements. It’s like a guess about future interest rates."
            },
            {
                "Title": "Future Value",
                "Explanation": "Future value means how much your investment will be worth in the future if it grows at a certain rate of return."
            },
            {
                "Title": "Futures Contracts",
                "Explanation": "These are contracts to buy or sell something on a future date at a fixed price, but they are traded on stock exchanges. They are more regulated than forward contracts and used for shares, bonds, gold, and many other assets."
            },
            {
                "Title": "FX Risk (Foreign Exchange Risk)",
                "Explanation": "This is the risk of losing money due to changes in currency exchange rates. For example, if you invest in US dollars and the dollar becomes weaker compared to the rupee, you could lose money when converting back to rupees."
            },
            {
                "Title": "Gap Ratio",
                "Explanation": "Gap ratio compares how much money a bank will get from its loans and investments, compared to how much money the bank will pay for its deposits and borrowings. It is shown as a percentage of total assets."
            },
            {
                "Title": "Gamma",
                "Explanation": "Gamma shows how fast the delta changes when the price of a stock or bond changes. (Delta shows how much the option price changes when the stock price changes — Gamma tells how fast this change happens.) This is mostly useful for people who trade in options."
            },
            {
                "Title": "Gilt-Edged Securities",
                "Explanation": "These are high-quality bonds issued by the UK government. Since these are backed by the UK government, they are very safe for investors."
            },
            {
                "Title": "Government Bonds",
                "Explanation": "These are bonds issued by the government to borrow money from the public. Since the government is responsible for paying back the money, these bonds are considered very safe."
            },
            {
                "Title": "Government Securities (G-Sec)",
                "Explanation": "In India, government bonds are called G-Sec (Government Securities). There are different types, like: Treasury Bills (short-term government bonds) Cash Management Bills (very short-term government bonds) Dated G-Secs (long-term government bonds) State Development Loans (bonds issued by state governments)"
            },
            {
                "Title": "Green Bonds",
                "Explanation": "Green bonds are special bonds where the money collected is used only for environment-friendly projects, like solar energy, wind power, or projects to reduce pollution."
            },
            {
                "Title": "Hedge Ratio",
                "Explanation": "Hedge ratio is a simple number that shows how much protection you have taken for your investment. For example, if you buy a bond and also take a future contract to protect yourself from price changes, this ratio shows how much of the risk is covered."
            },
            {
                "Title": "Hedging",
                "Explanation": "Hedging means protecting your money from risk. For example, if you buy gold, but you are scared gold prices might fall, you can make another investment that gains if gold prices fall. This way, you balance your risk."
            },
            {
                "Title": "Gross Domestic Product (GDP)",
                "Explanation": "GDP is the total value of all goods and services produced inside a country in one year. It is like a report card that shows how well a country’s economy is doing."
            },
            {
                "Title": "Held for Trading (HFT)",
                "Explanation": "This means buying something (like bonds, shares, or currencies) for short-term profit. These are not long-term investments — they are bought and sold quickly to earn from small price changes."
            },
            {
                "Title": "Held Till Maturity (HTM)",
                "Explanation": "These are bonds or investments that an investor plans to keep till the end — until the bond matures. The investor gets back the full amount (principal) at the end, along with any interest earned."
            },
            {
                "Title": "Hard Call Protection",
                "Explanation": "This is a special feature in some bonds. It means the company cannot repay (call back) the bond early before a certain date. This protects the investor, so they keep getting interest for the full period promised."
            },
            {
                "Title": "High Net Worth Individuals (HNI)",
                "Explanation": "These are rich investors who invest ₹10 lakh or more in bonds, shares, or other investments. In India, this includes wealthy individuals and Hindu Undivided Families (HUFs)."
            },
            {
                "Title": "High Yield Bonds",
                "Explanation": "These are risky bonds that have a low credit rating. Because they are risky, they pay higher interest to attract investors. High risk, high return."
            },
            {
                "Title": "Historical Disallowance",
                "Explanation": "This is a risk calculation trick used by experts. When they calculate how risky an investment is, they sometimes ignore extremely bad events (like big crashes) from history, so they can see a more normal risk level."
            },
            {
                "Title": "Humped Yield Curve",
                "Explanation": "This is a special type of interest rate chart for bonds. In this curve, medium-term bonds give the highest return — more than short-term and long-term bonds. This unusual shape shows that people expect something uncertain or unusual in the economy."
            },
            {
                "Title": "Historical Simulation",
                "Explanation": "This is a method to predict future risk by looking at past market events. It uses real historical prices to guess how much money you could lose if similar events happen again."
            },
            {
                "Title": "Immunization",
                "Explanation": "This is a way big investors (like banks or companies) protect themselves from changing interest rates. They match their investments (assets) with their payments (liabilities) so they don’t lose money if interest rates change."
            },
            {
                "Title": "Inflation",
                "Explanation": "Inflation means prices of things like food, clothes, petrol keep increasing over time. When inflation happens, the value of money goes down — you need more money to buy the same thing."
            },
            {
                "Title": "Inflation Indexed Bonds",
                "Explanation": "These are special bonds where interest and value increase with inflation. So, your investment is safe even if prices go up."
            },
            {
                "Title": "Inflation Risk",
                "Explanation": "This is the risk that inflation will reduce the value of your money. For example, if your bond pays 5% interest but inflation is 7%, you are actually losing money."
            },
            {
                "Title": "Infrastructure Bonds",
                "Explanation": "These are bonds where the money collected is used to build big projects like roads, bridges, airports, and railways."
            },
            {
                "Title": "Information Memorandum",
                "Explanation": "This is a document that companies give to investors before selling bonds. It has all important details — like company information, bond terms, risks, and financial data."
            },
            {
                "Title": "Institutional Investor",
                "Explanation": "These are big investors like banks, insurance companies, mutual funds, pension funds — they invest a lot of money on behalf of others."
            },
            {
                "Title": "Interest Rate Parity",
                "Explanation": "This is a financial rule which says that the difference between interest rates of two countries should match with the difference in currency exchange rates between those countries. This concept is mainly used by professional investors."
            },
            {
                "Title": "Interest Rate Swap",
                "Explanation": "This is a special agreement between two parties where they exchange interest payments. One pays fixed interest, and the other pays floating (changing) interest. Big companies use this to manage risk."
            },
            {
                "Title": "Interest Rate Risk",
                "Explanation": "This is the risk that bond prices will fall if interest rates rise. Longer-term bonds have more risk from changing interest rates."
            },
            {
                "Title": "Internal Rate of Return (IRR)",
                "Explanation": "IRR shows how much profit you can expect from an investment every year. It’s a way to measure how good an investment is."
            },
            {
                "Title": "Interpolation",
                "Explanation": "Interpolation is a method to estimate missing numbers between two known numbers. It is like guessing the value in between based on existing data."
            },
            {
                "Title": "International Securities Identification Number (ISIN)",
                "Explanation": "ISIN is a special code given to every bond or share so that it can be easily identified in any market around the world. It works like an Aadhaar number for securities."
            },
            {
                "Title": "International Monetary Fund (IMF)",
                "Explanation": "IMF is a global organization that helps countries manage their economy, gives emergency loans, and supports financial stability around the world."
            },
            {
                "Title": "Intrinsic Value",
                "Explanation": "This is the real value of an investment based on things like profits, cash flow, assets, and business strength — not just market price."
            },
            {
                "Title": "In-The-Money",
                "Explanation": "In options trading, \"in-the-money\" means the option is profitable if used today. For example, if you have an option to buy a stock at ₹90 and the stock price is ₹100, you are \"in-the-money\" because you can buy for ₹90 and sell for ₹100."
            },
            {
                "Title": "Inverse Floater",
                "Explanation": "This is a special bond where interest rate goes down if market rates go up, and vice versa. It works opposite to normal floating rate bonds."
            },
            {
                "Title": "Inverted Yield Curve",
                "Explanation": "This is when short-term bonds give higher interest than long-term bonds. This is not normal and often means people expect economic problems in the future."
            },
            {
                "Title": "IOU (I Owe You)",
                "Explanation": "IOU is a simple written promise that one person will repay money to another person later. It is less formal than a bond but still shows a debt."
            },
            {
                "Title": "Investment-Grade Debt",
                "Explanation": "These are bonds that are considered safe by credit rating agencies. These bonds have a low chance of default."
            },
            {
                "Title": "Issue Date",
                "Explanation": "This is the date when the bond is first sold to investors. This is the starting date for interest payments and maturity calculation."
            },
            {
                "Title": "Junk Bonds",
                "Explanation": "Junk bonds are very risky bonds issued by companies with poor credit ratings. These companies might have financial problems or weak businesses, so there is a higher chance they may fail to repay the money."
            },
            {
                "Title": "Kangaroo Bonds",
                "Explanation": "These are bonds issued by foreign companies in Australia, but in Australian dollars. Example: A US company can issue Kangaroo Bonds in Australia to raise money from Australian investors."
            },
            {
                "Title": "Know Your Customer (KYC)",
                "Explanation": "KYC means \"Know Your Customer\". It is a process where banks and financial companies check who you are before opening an account or allowing you to invest. In KYC, you have to give documents like Aadhaar, PAN, address proof, and income proof. This helps prevent fraud, money laundering, or illegal activities."
            },
            {
                "Title": "Lead Manager",
                "Explanation": "When a company wants to issue bonds, the lead manager is the main bank or financial company that helps with the full process — like planning the bond, deciding the price, finding investors, and managing all the work till the bond is issued."
            },
            {
                "Title": "Letter of Credit",
                "Explanation": "A Letter of Credit is a promise from a bank that they will pay money to someone (beneficiary) if the buyer does not pay. It gives safety in big business deals."
            },
            {
                "Title": "Kimchi Bonds",
                "Explanation": "These are bonds issued by foreign companies in South Korea, but in a foreign currency (not in Korean Won). Example: A Japanese company can issue Kimchi Bonds in South Korea to raise money from Korean investors."
            },
            {
                "Title": "Leverage",
                "Explanation": "Leverage means borrowing money to invest more. The idea is to make higher profit by investing a larger amount. But remember — if the investment loses money, the loss will also be bigger."
            },
            {
                "Title": "Liability Swap",
                "Explanation": "This is a special agreement where two parties exchange the type of payments they have to make — for example, one party pays fixed interest and the other pays floating interest."
            },
            {
                "Title": "Liability",
                "Explanation": "Liability means money you owe to someone. It could be a loan, money for goods you bought on credit, or any other amount you have to pay in future."
            },
            {
                "Title": "Liquidation",
                "Explanation": "Liquidation means selling everything a company owns (like land, machinery, stock) to get cash — usually when the company is closing down or can’t pay its debts."
            },
            {
                "Title": "Liquidity Measure",
                "Explanation": "This is a simple way to check how easily something can be bought or sold in the market without affecting its price too much."
            },
            {
                "Title": "Liquidity",
                "Explanation": "Liquidity means how easily you can sell something (like a bond or share) for fair price in the market. If it sells quickly with no trouble, it’s called high liquidity. If it’s hard to sell, it’s low liquidity."
            },
            {
                "Title": "Liquidity Adjustment Facility (LAF)",
                "Explanation": "This is a tool used by RBI to control money flow in the banking system. Banks can borrow money from RBI (repo) or keep extra money with RBI (reverse repo) to manage their daily cash needs."
            },
            {
                "Title": "Listed Bonds",
                "Explanation": "Listed bonds are bonds that are traded on the stock exchange — just like shares. Anyone can buy or sell these bonds in the open market. Listed bonds are easier to sell because they are more liquid and follow exchange rules."
            },
            {
                "Title": "Liquidity Risk",
                "Explanation": "Liquidity risk is the risk that you won’t be able to sell your investment quickly when you need cash. If the market is bad, you may have to sell at a lower price or wait a long time to find a buyer."
            },
            {
                "Title": "London Interbank Offered Rate (LIBOR)",
                "Explanation": "LIBOR was a popular global interest rate used for international loans and bonds. It showed the rate at which banks lend to each other in London. Now, LIBOR is slowly ending, and a new rate called SOFR is replacing it."
            },
            {
                "Title": "Long Position",
                "Explanation": "Long position means you buy bonds to hold for a long time because you believe their price will go up or you want to earn regular interest."
            },
            {
                "Title": "Maintenance Margin",
                "Explanation": "When you buy bonds using borrowed money (margin trading), your account must always have a minimum balance. If your balance falls below this limit, you may have to add more money or sell some bonds."
            },
            {
                "Title": "Long-Term Capital Gain (LTCG)",
                "Explanation": "This is the profit you earn by selling a bond after holding it for more than 1 year. It is called long-term capital gain."
            },
            {
                "Title": "Long-Term Capital Gain Tax",
                "Explanation": "This is the tax you pay on long-term capital gain from selling listed bonds. In India, the tax rate is 10% without indexation (adjusting for inflation)."
            },
            {
                "Title": "Margin Call",
                "Explanation": "If your account balance becomes too low while trading with borrowed money, your broker will ask you to add more funds or sell some investments. This request is called a \"margin call.\""
            },
            {
                "Title": "Market-Linked Debentures (MLDs)",
                "Explanation": "These are bonds where returns depend on how well a market index (like the NIFTY 50) performs. Unlike regular bonds, they don’t have a fixed interest rate. If the market does well, you can earn higher returns."
            },
            {
                "Title": "Market Maker",
                "Explanation": "A market maker is a company or person who helps people buy and sell bonds by always being ready to trade. They keep the market active by buying and selling bonds from their own stock."
            },
            {
                "Title": "Market Risk",
                "Explanation": "This is the risk of losing money due to changes in market conditions like interest rates, inflation, or economic downturns. If the market goes down, the value of your investment may decrease."
            },
            {
                "Title": "Market Risk Capital Charge (MRCC)",
                "Explanation": "Banks and financial institutions must keep aside a certain amount of money to cover possible losses caused by market fluctuations. This ensures they remain stable even if the market goes down."
            },
            {
                "Title": "Mark-to-Market (MTM)",
                "Explanation": "This is a way to check the current value of an investment based on the latest market price. If the market price changes daily, the value of your investment will also change."
            },
            {
                "Title": "Masala Bonds",
                "Explanation": "These are bonds issued outside India but in Indian Rupees. Foreign investors can buy them, but the money remains in Indian currency."
            },
            {
                "Title": "Matador Bonds",
                "Explanation": "These are bonds issued in Spain by foreign companies but in Spanish currency (pesetas)."
            },
            {
                "Title": "Maturity Date",
                "Explanation": "This is the date when a bond’s investment period ends, and the issuer returns your money along with any interest due."
            },
            {
                "Title": "Medium-Term Notes (MTNs)",
                "Explanation": "These are bonds with a maturity period of 5 to 10 years. Companies, banks, or governments issue them to raise money. The terms can be adjusted to fit both the issuer’s needs and the investor’s preferences."
            },
            {
                "Title": "Modified Duration",
                "Explanation": "This tells how much the price of a bond will change if interest rates increase or decrease. If interest rates go up, bond prices generally go down, and vice versa."
            },
            {
                "Title": "Money Market",
                "Explanation": "A place where short-term loans and bonds (less than one year) are bought and sold. Examples include Treasury bills and commercial papers."
            },
            {
                "Title": "Multiple Price Auction",
                "Explanation": "A method of selling bonds where different buyers pay different prices based on their bids. The highest bidders get the bonds first."
            },
            {
                "Title": "Mortgage-Backed Security (MBS)",
                "Explanation": "A type of investment where returns come from home loans. Banks bundle home loans and sell them as securities, and investors earn from the loan payments made by homeowners."
            },
            {
                "Title": "Moving Average",
                "Explanation": "A method used in stock and bond markets to smooth price trends over time. It helps investors see long-term patterns by averaging past prices."
            },
            {
                "Title": "Mumbai Interbank Offered Rate (MIBOR)",
                "Explanation": "The interest rate at which banks in Mumbai lend money to each other. It is used as a reference rate for loans and financial products in India."
            },
            {
                "Title": "Mumbai Interbank Forward Offer Rate (MIFOR)",
                "Explanation": "A benchmark interest rate used in India for pricing financial contracts like forward rate agreements (FRAs)."
            },
            {
                "Title": "Municipal Bonds",
                "Explanation": "Bonds issued by city governments (municipal corporations) in India to fund public projects like roads, water supply, and schools. Investors who buy these bonds help finance local development."
            },
            {
                "Title": "Naked",
                "Explanation": "In finance, \"naked\" means making a trade without owning the actual asset. For example, selling an option (a financial contract) without owning the stock it is linked to is called a \"naked option.\""
            },
            {
                "Title": "National Stock Exchange (NSE)",
                "Explanation": "The National Stock Exchange (NSE) is one of India’s largest stock exchanges where people buy and sell shares, bonds, and other financial instruments. It is fully digital and operates online. The NSE runs the NIFTY 50 index, which tracks the top 50 companies in India."
            },
            {
                "Title": "NDS-OM (Negotiated Dealing System-Order Matching)",
                "Explanation": "This is an online platform in India where government bonds are bought and sold. It helps traders match buy and sell orders quickly and transparently. The Reserve Bank of India (RBI) manages this system to ensure smooth trading of government securities."
            },
            {
                "Title": "Non-Banking Financial Company (NBFC)",
                "Explanation": "NBFCs are financial companies that provide services like loans, fixed deposits, and investments, but they are not full-fledged banks. They cannot issue bank cheques or accept savings/current deposits like regular banks. Examples include microfinance companies and housing finance companies."
            },
            {
                "Title": "Non-Competitive Bid",
                "Explanation": "When the government sells bonds in an auction, a \"non-competitive bid\" allows small investors to buy bonds at the final rate decided in the auction, without having to compete with big investors."
            },
            {
                "Title": "Net Present Value (NPV)",
                "Explanation": "NPV is a way to check if an investment is profitable. It compares how much money you expect to earn in the future with the money you invest today. If NPV is positive, the investment is considered good because it is expected to make more money than it costs."
            },
            {
                "Title": "Non-Institutional Investors",
                "Explanation": "This category includes individuals, small businesses, trusts, partnership firms, and organizations that invest in stocks, bonds, or other financial instruments but are not large institutions like banks or mutual funds."
            },
            {
                "Title": "Non-Convertible Debentures (NCDs)",
                "Explanation": "These are long-term investment options issued by companies to raise money. Unlike some bonds, NCDs cannot be converted into shares of the company. They provide fixed interest returns to investors."
            },
            {
                "Title": "OBPP (Online Bond Platform Provider)",
                "Explanation": "This is an online platform registered with SEBI that helps people buy and sell bonds digitally. It allows investors to see different bond options, compare prices, and complete transactions easily."
            },
            {
                "Title": "Off-Market",
                "Explanation": "A trade that happens at a price different from the market price or outside regular market rules is called an \"off-market\" transaction."
            },
            {
                "Title": "Offer Price",
                "Explanation": "The offer price is the price at which a seller is willing to sell a bond. It is the amount you need to pay if you want to buy that bond."
            },
            {
                "Title": "Offset",
                "Explanation": "This is a way to reduce risk in investments. If you have one investment that may lose money, you can make another investment that moves in the opposite direction to balance the loss."
            },
            {
                "Title": "Off-the-Run Security",
                "Explanation": "A bond that was issued in the past but is no longer the newest or most actively traded in the market."
            },
            {
                "Title": "Open Interest",
                "Explanation": "This is the total number of active contracts (like options or futures) that have not been settled. It helps investors understand the level of trading activity in a market."
            },
            {
                "Title": "On-the-Run Security",
                "Explanation": "The most recently issued and actively traded bond in the market. These bonds are usually the most liquid (easiest to buy and sell)."
            },
            {
                "Title": "Operational Risk",
                "Explanation": "This is the risk of losing money due to problems in a company’s systems, human errors, fraud, or unexpected events like cyberattacks or business shutdowns."
            },
            {
                "Title": "Open Market Operation (OMO)",
                "Explanation": "When the Reserve Bank of India (RBI) buys or sells government bonds in the open market to control money supply and interest rates in the economy."
            },
            {
                "Title": "Optimal Hedge",
                "Explanation": "A strategy used to reduce or remove the risk of an investment. It involves using tools like options or futures to protect against possible losses."
            },
            {
                "Title": "Option",
                "Explanation": "An option is a type of financial contract that gives the buyer the right (but not the obligation) to buy or sell an asset at a fixed price before a set date."
            },
            {
                "Title": "Opportunity Cost",
                "Explanation": "When you choose one option, you give up the benefits of another option. The value of the option you didn’t choose is called \"opportunity cost.\""
            },
            {
                "Title": "Option-Adjusted Spread (OAS)",
                "Explanation": "This is the difference in interest rates between a bond and a standard market rate. It also considers special features of the bond, like whether the issuer can repay early (call option) or if the bondholder can sell it back early (put option)."
            },
            {
                "Title": "Out-of-the-Money",
                "Explanation": "An option contract that has no value at the moment. For example: A call option is out-of-the-money if the current price of the stock is lower than the option’s price. A put option is out-of-the-money if the current price of the stock is higher than the option’s price."
            },
            {
                "Title": "Overnight Index Swaps (OIS)",
                "Explanation": "A financial agreement where two parties exchange fixed and floating interest payments based on an overnight interest rate. It is mainly used to manage interest rate risk."
            },
            {
                "Title": "Par Value of a Bond",
                "Explanation": "The original amount invested in a bond, which the company or government promises to return when the bond matures. It is also called the face value or nominal value of the bond."
            },
            {
                "Title": "Over-the-Counter (OTC)",
                "Explanation": "This is a way of trading securities (like bonds or stocks) directly between two parties instead of using a stock exchange. OTC markets are flexible but may have less transparency than regular stock markets."
            },
            {
                "Title": "Par Yield Curve",
                "Explanation": "A graph that shows the interest rates of bonds with different maturity periods, but with the same fixed interest payments (coupon rate) and trading at face value."
            },
            {
                "Title": "Panda Bonds",
                "Explanation": "These are bonds issued in China by foreign companies, but they are priced in Chinese currency (Yuan)."
            },
            {
                "Title": "Perfect Hedge",
                "Explanation": "A strategy that completely removes the risk of loss by making an opposite investment. It is very difficult to achieve in reality."
            },
            {
                "Title": "Perpetual Bond",
                "Explanation": "A bond that does not have a maturity date, meaning it pays interest to the investor forever."
            },
            {
                "Title": "Physical Delivery",
                "Explanation": "When a contract (like a futures or options contract) is settled by actually delivering the asset (such as bonds or shares) instead of paying cash."
            },
            {
                "Title": "Prepayment Risk",
                "Explanation": "The risk that a borrower repays a loan or mortgage early. This can be a problem for investors because they may not receive all the expected interest payments."
            },
            {
                "Title": "Premium Bond",
                "Explanation": "A bond that is sold at a price higher than its original face value. The extra amount paid over the face value is called the premium."
            },
            {
                "Title": "Primary Dealers",
                "Explanation": "Financial institutions that buy government bonds directly from the government and help sell them to other investors in the market. They help keep the bond market active."
            },
            {
                "Title": "Price Value of a Basis Point (PVBP)",
                "Explanation": "A measure of how much the price of a bond changes when the interest rate changes by 0.01% (one basis point)."
            },
            {
                "Title": "Present Value",
                "Explanation": "The current worth of a future amount of money, after considering factors like inflation and interest rates. It is used to determine the value of investments today."
            },
            {
                "Title": "Primary Market",
                "Explanation": "The market where companies or governments sell bonds for the first time to raise money. Investors buy directly from the issuer."
            },
            {
                "Title": "Private Placement",
                "Explanation": "When a company sells bonds directly to a few selected investors instead of offering them to the general public."
            },
            {
                "Title": "Probability of Default",
                "Explanation": "The chance that a borrower (a company or government) may fail to repay its debt. A higher probability of default means a riskier investment."
            },
            {
                "Title": "Protection Buyer",
                "Explanation": "An investor who buys protection against the risk of a borrower not paying back a loan."
            },
            {
                "Title": "Product Note",
                "Explanation": "A document that explains the details of a bond before it is sold, including the company issuing it, interest rates, maturity date, and risks."
            },
            {
                "Title": "PSU Bonds",
                "Explanation": "Bonds issued by Public Sector Undertakings (PSUs)—government-owned companies in India. These bonds are considered safe investments because they are backed by the government."
            },
            {
                "Title": "Protection Seller",
                "Explanation": "An investor or financial company that sells protection to another investor, promising to pay if a borrower fails to repay a loan."
            },
            {
                "Title": "Public Issue of NCDs (Bond IPO)",
                "Explanation": "When a company sells Non-Convertible Debentures (NCDs) to the general public to raise money. This is similar to a stock IPO but for bonds."
            },
            {
                "Title": "Put Option",
                "Explanation": "A financial contract that allows an investor to sell an asset (like stocks or bonds) at a fixed price before a certain date."
            },
            {
                "Title": "Public Placement",
                "Explanation": "Selling bonds or shares to the general public instead of private investors. Companies use public placement to raise money, but they must follow government regulations."
            },
            {
                "Title": "Puttable Bond",
                "Explanation": "A special type of bond that allows the investor to sell it back to the issuer before the maturity date at a pre-agreed price."
            },
            {
                "Title": "Quasi-Government Bond",
                "Explanation": "A quasi-government bond is a type of bond issued by companies or organizations that are linked to the government but not directly controlled by it. Examples include government agencies or public sector companies. These bonds are generally considered safe investments because they have government support."
            },
            {
                "Title": "Redemption Date",
                "Explanation": "The date when a bond matures and the company or government returns your money (principal amount)."
            },
            {
                "Title": "Reference Asset",
                "Explanation": "A specific asset or group of assets that determines the performance of a financial investment."
            },
            {
                "Title": "Reinvestment Risk",
                "Explanation": "The risk that when you earn money from an investment (such as interest payments), you may have to reinvest it at a lower interest rate, reducing future earnings."
            },
            {
                "Title": "Registrar",
                "Explanation": "A company that keeps records of bondholders and handles administrative tasks related to bond issuance."
            },
            {
                "Title": "Repo Rate",
                "Explanation": "The interest rate at which the Reserve Bank of India (RBI) lends money to commercial banks for short-term needs. This rate affects inflation and economic growth."
            },
            {
                "Title": "Reinvestment Rate",
                "Explanation": "The rate at which you can reinvest the money earned from an investment into another investment."
            },
            {
                "Title": "Request for Quote (RFQ) Platform",
                "Explanation": "An online system where investors can ask for and compare price quotes before buying or selling bonds. It helps improve transparency and efficiency in trading."
            },
            {
                "Title": "Reserve Bank of India (RBI)",
                "Explanation": "India's central bank that manages the country's money supply, controls inflation, and regulates financial policies."
            },
            {
                "Title": "Retail Investors",
                "Explanation": "Individuals who invest their own money in the stock or bond markets. In India, retail investors usually invest up to ₹10 Lakhs. This includes Resident Indian Individuals and Hindu Undivided Families (HUFs)."
            },
            {
                "Title": "Residual Maturity",
                "Explanation": "The time left until a bond matures and the investor gets back the principal amount."
            },
            {
                "Title": "Reverse Repo Rate",
                "Explanation": "The interest rate at which RBI borrows money from commercial banks for short-term purposes. It is used to control liquidity in the financial system."
            },
            {
                "Title": "Risk Management",
                "Explanation": "The process of identifying, assessing, and reducing risks in investments to avoid big losses."
            },
            {
                "Title": "Reverse Cash-and-Carry Arbitrage",
                "Explanation": "A trading strategy where an investor sells a security in the spot market and buys the same security in the futures market to make a profit from price differences."
            },
            {
                "Title": "Rolling Returns",
                "Explanation": "A way to measure how an investment performed over different time periods. Instead of looking at total returns over one fixed period, it checks returns over multiple overlapping periods to give a clearer picture of performance."
            },
            {
                "Title": "Risk-Free Return",
                "Explanation": "The return from an investment that has zero risk of losing money. Government bonds (G-secs) are considered risk-free because they are backed by the Indian government."
            },
            {
                "Title": "Samurai Bonds",
                "Explanation": "These are bonds issued in Japan by foreign companies. They are priced in Japanese currency (Yen)."
            },
            {
                "Title": "Secured Bonds",
                "Explanation": "These are bonds that are backed by assets. If the company fails to repay, bondholders can claim the assets to recover their money."
            },
            {
                "Title": "Secured Overnight Financing Rate (SOFR)",
                "Explanation": "A benchmark interest rate used to measure short-term borrowing costs in the U.S. financial system. It has replaced LIBOR in many financial contracts."
            },
            {
                "Title": "Secondary Market",
                "Explanation": "A market where investors buy and sell old bonds that were issued earlier. It helps investors sell bonds anytime and determine their fair market price."
            },
            {
                "Title": "Securitization",
                "Explanation": "A process where different types of loans are combined and sold as investment products in the market."
            },
            {
                "Title": "Senior Bonds",
                "Explanation": "Bonds that have a higher repayment priority than other bonds if a company goes bankrupt. These bondholders get paid before other creditors."
            },
            {
                "Title": "Securities and Exchange Board of India (SEBI)",
                "Explanation": "The regulator of financial markets in India. SEBI ensures that the stock and bond markets work fairly and protect investors' interests."
            },
            {
                "Title": "STRIPs (Separate Trading of Registered Interest and Principal Securities)",
                "Explanation": "Special types of zero-coupon bonds created by splitting regular bonds into two parts—one for interest payments and one for principal repayment."
            },
            {
                "Title": "Settlement",
                "Explanation": "The final step in buying or selling a bond, where ownership is transferred and money is exchanged between the buyer and seller."
            },
            {
                "Title": "Short Position",
                "Explanation": "A trading strategy where an investor sells a borrowed security hoping to buy it later at a lower price and make a profit."
            },
            {
                "Title": "Serial Bond",
                "Explanation": "A bond where the repayment is made in parts over different years instead of a single maturity date."
            },
            {
                "Title": "Settlement Risk",
                "Explanation": "The risk that one party fails to complete the bond transaction, causing financial loss to the other party."
            },
            {
                "Title": "Settlement Date",
                "Explanation": "The date on which the buyer officially receives the bond, and the seller gets the payment."
            },
            {
                "Title": "Short Hedge",
                "Explanation": "A strategy used to protect against a price drop by selling a related financial product."
            },
            {
                "Title": "Short-Term Capital Gain",
                "Explanation": "Profit earned by selling a bond or other asset within one year or less after buying it."
            },
            {
                "Title": "Simple Interest",
                "Explanation": "A basic way of calculating interest only on the original amount invested. Formula: Simple Interest = Principal × Interest Rate × Time (years)"
            },
            {
                "Title": "Short-Term Capital Gain Tax",
                "Explanation": "Tax applied to profits made from selling a bond or security within one year. The tax rate is based on the investor’s income tax slab."
            },
            {
                "Title": "Sovereign Gold Bonds (SGBs)",
                "Explanation": "Government bonds linked to gold prices. These bonds allow investors to invest in gold without buying physical gold and also pay fixed interest."
            },
            {
                "Title": "Single Price Auction",
                "Explanation": "An auction where all winning buyers pay the same price for bonds, regardless of their bid amounts."
            },
            {
                "Title": "Special Purpose Vehicle (SPV)",
                "Explanation": "A separate company created for a specific financial transaction like issuing bonds, managing loans, or reducing risk."
            },
            {
                "Title": "Special Securities",
                "Explanation": "Government bonds given to certain industries like oil, fertilizer, and food supply companies instead of direct cash payments."
            },
            {
                "Title": "Specific Risk",
                "Explanation": "The risk linked to a particular company or industry that cannot be avoided even if you invest in many assets."
            },
            {
                "Title": "Speculation",
                "Explanation": "A high-risk investment strategy where investors buy or sell assets hoping to make quick profits based on price changes."
            },
            {
                "Title": "Spot Price",
                "Explanation": "The current market price at which an asset (such as a bond or gold) can be bought or sold immediately."
            },
            {
                "Title": "Spot Rate of Interest",
                "Explanation": "The interest rate on a zero-coupon bond that matures at a specific time."
            },
            {
                "Title": "Staggered Maturity",
                "Explanation": "A strategy where an investor buys bonds that mature at different times to maintain a steady cash flow."
            },
            {
                "Title": "State Development Loans (SDLs)",
                "Explanation": "Bonds issued by Indian state governments to fund projects like roads, bridges, and schools."
            },
            {
                "Title": "Statutory Liquidity Ratio (SLR)",
                "Explanation": "The percentage of money that banks must keep as cash, gold, or government bonds before giving loans. RBI sets this ratio to control inflation and financial stability."
            },
            {
                "Title": "Step-Up / Step-Down Bonds",
                "Explanation": "Bonds where the interest rate increases (step-up) or decreases (step-down) at fixed intervals."
            },
            {
                "Title": "State Government Guaranteed Bonds",
                "Explanation": "Bonds issued by state governments, backed by their ability to collect taxes. These bonds are considered safe investments."
            },
            {
                "Title": "Stress Testing",
                "Explanation": "A process where financial risks are checked by applying extreme market conditions to see if investments can survive in tough times."
            },
            {
                "Title": "Strike Price (Exercise Price)",
                "Explanation": "The fixed price at which an investor can buy or sell an asset under an options contract."
            },
            {
                "Title": "Swap Rate",
                "Explanation": "A fixed interest rate exchanged between two parties in a financial agreement."
            },
            {
                "Title": "Subordinated Debt",
                "Explanation": "A type of debt that is repaid after other debts in case of a company's bankruptcy. It has higher risk but may offer higher returns."
            },
            {
                "Title": "Swap Spread",
                "Explanation": "The difference between the swap rate and the government bond yield for the same maturity period."
            },
            {
                "Title": "Tax-Free Bonds",
                "Explanation": "These are bonds issued by government-backed organizations, and the interest earned on them is not taxed. They are a good option for investors who want safe investments with tax benefits while supporting government projects."
            },
            {
                "Title": "Tenor",
                "Explanation": "Tenor is the time period from when a bond is issued until it is repaid. It can be short-term or long-term, depending on the bond type and the issuer’s needs."
            },
            {
                "Title": "Tranche",
                "Explanation": "A part or section of a bond issue. When a company or government issues a large number of bonds, they divide them into different parts (tranches), which may have different interest rates, risk levels, or repayment dates."
            },
            {
                "Title": "Treasury Bill (T-Bill)",
                "Explanation": "A short-term government bond issued by the Reserve Bank of India (RBI). T-bills do not pay regular interest but are sold at a lower price and repaid at full value when they mature. The profit is the difference between the buying price and maturity value. T-bills come with 91-day, 182-day, or 364-day maturity periods."
            },
            {
                "Title": "Term Sheet",
                "Explanation": "A summary document that explains the main details of a bond before it is issued. It includes information like interest rate, maturity date, and other important conditions."
            },
            {
                "Title": "Uniform Price Auction",
                "Explanation": "A type of auction where all winning bidders pay the same price for an item, no matter what price they originally bid. The final price is set at the highest bid that allows all units to be sold."
            },
            {
                "Title": "UDAY Bonds",
                "Explanation": "These are special bonds issued by Indian state governments under the Ujwal DISCOM Assurance Yojana (UDAY). This scheme was started to help revive power distribution companies (DISCOMs) facing financial problems."
            },
            {
                "Title": "Unlisted Bonds",
                "Explanation": "Bonds that are not traded on a stock exchange. These are bought and sold privately (over-the-counter or OTC) and do not follow strict market rules like listed bonds."
            },
            {
                "Title": "Underlying Asset",
                "Explanation": "The main asset that decides the value of a financial contract (like a derivative). It can be stocks, bonds, gold, currencies, or other assets. If the price of the underlying asset changes, the value of the contract also changes."
            },
            {
                "Title": "Value-at-risk (VaR)",
                "Explanation": "Value-at-risk (VaR) tells us how much money we might lose on an investment in a worst-case situation during a specific period. It helps investors understand the possible loss in normal market conditions and is usually shown as a percentage of the total investment."
            },
            {
                "Title": "Unsecured Bonds",
                "Explanation": "Bonds that are not backed by any physical asset. Instead, they depend only on the financial strength of the company or government issuing them. These may offer higher interest rates but are riskier than secured bonds."
            },
            {
                "Title": "Vertical disallowance",
                "Explanation": "Vertical disallowance is a tax rule that stops people from using losses from one type of income to reduce tax on another type of income. This rule exists because different types of income have different tax rules, and the government does not allow mixing them for tax benefits."
            },
            {
                "Title": "Volatility",
                "Explanation": "Volatility means how much and how quickly the price of an investment goes up and down. If the price changes a lot in a short time, it is considered highly volatile. More volatility means higher risk and uncertainty."
            },
            {
                "Title": "Volatility Risk",
                "Explanation": "Volatility risk is the risk of losing money due to sudden price changes in the market. This can happen because of things like interest rate changes, political events, or changes in the economy. If an investment is in a highly volatile market, it can be risky because prices may rise and fall unpredictably."
            },
            {
                "Title": "Wholesale Price Index (WPI)",
                "Explanation": "The Wholesale Price Index (WPI) measures how the prices of goods sold in bulk (wholesale) change over time. It helps track inflation by showing price increases before they reach consumers. The government and businesses use WPI to understand market trends and make important decisions."
            },
            {
                "Title": "Yield Curve",
                "Explanation": "The yield curve is a graph that shows the relationship between the interest rates (yields) of bonds with different time periods (maturities). It helps investors understand how interest rates may change over time."
            },
            {
                "Title": "Yield",
                "Explanation": "Yield is the return or profit an investor earns from an investment over a certain period. It is usually shown as a percentage of the bond price or investment amount."
            },
            {
                "Title": "Yield Spread",
                "Explanation": "Yield spread is the difference in interest rates between two bonds. It usually happens because one bond has a higher risk than the other. If the gap (spread) increases, it means investors see more risk in the market. If it decreases, the market is seen as safer."
            },
            {
                "Title": "Yankee Bond",
                "Explanation": "A Yankee bond is a type of bond issued in the United States by a foreign company or government, but the bond is in US dollars."
            },
            {
                "Title": "Yield to Call (YTC)",
                "Explanation": "Yield to Call (YTC) is the return an investor will earn if the bond is repaid (called) early by the company or government before its original maturity date."
            },
            {
                "Title": "Yield to Maturity (YTM)",
                "Explanation": "Yield to Maturity (YTM) is the total return an investor will earn if they keep the bond until its final maturity date, assuming all interest payments are reinvested."
            },
            {
                "Title": "Yield to Average Life (YAL)",
                "Explanation": "Yield to Average Life (YAL) is the return an investor earns on a bond if they hold it until the average time by which its payments are completed."
            },
            {
                "Title": "Yield to Put (YTP)",
                "Explanation": "Yield to Put (YTP) is the return an investor will get if they choose to sell the bond back to the issuer before its maturity date, using a special option called a \"put option.\""
            },
            {
                "Title": "Yield to Worst (YTW)",
                "Explanation": "Yield to Worst (YTW) is the lowest return an investor might get if the bond is paid off early under any condition, such as being called or redeemed before the maturity date."
            },
            {
                "Title": "Zero Coupon Bond",
                "Explanation": "A zero coupon bond is a bond that does not pay interest regularly. Instead, it is sold at a lower price and repaid at full value when it matures. The profit for the investor is the difference between the buying price and the final value at maturity."
            },
            {
                "Title": "Zero Coupon Yield Curve",
                "Explanation": "The zero coupon yield curve is a graph that shows the interest rates of zero coupon bonds with different time periods. It helps investors understand how interest rates change over time for these bonds."
            },
            {
                "Title": "Basis Point (BPS)",
                "Explanation": "A basis point (BPS) is a small unit used to measure changes in interest rates or financial values. One basis point equals 0.01% (one-hundredth of a percent).gfhfgh"
            },
            {
                "Title": "Updated",
                "Explanation": "gdfgdg"
            },
            {
                "Title": "Accretion of Bonds",
                "Explanation": "Accretion of bonds means the increase in the value of a bond over time. This happens when a bond is bought at a lower price than its full value (face value). As time passes, the bond’s value slowly rises until it reaches its full value. This is common in zero-coupon bonds, which do not pay interest regularly but grow in value over time."
            },
            {
                "Title": "Accrued Interest",
                "Explanation": "Accrued interest is the interest that builds up on a bond between two interest payment dates. If you buy a bond in the middle of this period, you may have to pay the seller the interest they earned for the time they held the bond. This ensures that the seller gets the interest they are owed for the period before selling the bond."
            }
        ]
    }
};



const gqlq = `mutation Mutation($data: GlossaryInput!) {
  createGlossary(data: $data) {
    Title
    Explanation
  }
}`;


for (let index = 0; index < data.data.glossaries.length; index++) {
    const element = data.data.glossaries[index];

    await gqlClient.mutate({
        mutation: gql(gqlq),
        variables: {
            data: {
                "Explanation": element.Explanation,
                "Title": element.Title
            }
        }
    })
    console.log(index);

}
/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 */

/**
 * @typedef {Object} CookingOption
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {number} priceAdd
 * @property {boolean} isDefault
 */

/**
 * @typedef {Object} BilingualBullet
 * @property {string} nameEn
 * @property {string} nameAr
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {number} price
 * @property {string} category
 * @property {string} image
 * @property {string} descriptionEn
 * @property {string} descriptionAr
 * @property {CookingOption[]} cookingOptions
 * @property {string[]} [availableExtras]
 * @property {string[]} [availableSizes]
 * @property {Object.<string,number>} [sizeCalories]
 * @property {Object.<string,number>} [sizePriceAdd]
 * @property {number} calories
 * @property {BilingualBullet[]} [ingredients]
 * @property {string[]} [allergies]
 */

/**
 * @typedef {Object} SizeOption
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {number} priceAdd
 */

/**
 * @typedef {Object} AllergyOption
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 */

/**
 * @typedef {Object} ExtrasOption
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {number} price
 * @property {number} [calories]
 * @property {string[]} [allergyIds]
 */

/**
 * @typedef {Object} OfferItem
 * @property {string} menuItemId
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {number} qty
 */

/**
 * @typedef {Object} Offer
 * @property {string} id
 * @property {string} titleEn
 * @property {string} titleAr
 * @property {string} descriptionEn
 * @property {string} descriptionAr
 * @property {string} image
 * @property {string} discount
 * @property {number} originalPrice
 * @property {number} offerPrice
 * @property {OfferItem[]} items
 * @property {boolean} isActive
 */

/**
 * @typedef {'pending' | 'preparing' | 'onTheWay' | 'delivered' | 'cancelled'} OrderStatus
 */

/**
 * @typedef {'card' | 'cash'} PaymentMethod
 */

/**
 * @typedef {Object} OrderItemOption
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {number} priceAdd
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {number} price
 * @property {number} quantity
 * @property {OrderItemOption} [selectedSize]
 * @property {OrderItemOption} [selectedCookingOption]
 * @property {OrderItemOption[]} [selectedExtras]
 * @property {number} subtotal
 */

/**
 * @typedef {Object} Order
 * @property {string} id
 * @property {string} orderNumber
 * @property {string} plateNumber
 * @property {string} carModel
 * @property {string} carColor
 * @property {PaymentMethod} paymentMethod
 * @property {number} [cashAmount]
 * @property {number} [changeAmount]
 * @property {OrderItem[]} items
 * @property {number} total
 * @property {OrderStatus} status
 * @property {string} restaurantId
 * @property {string} [restaurantName]
 * @property {string} [userId]
 * @property {import('firebase/firestore').Timestamp} createdAt
 * @property {import('firebase/firestore').Timestamp} updatedAt
 */

/**
 * @typedef {Object} Restaurant
 * @property {string} id
 * @property {string} nameEn
 * @property {string} nameAr
 * @property {string} address
 * @property {string} phone
 * @property {string} logoImage
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Customer
 * @property {string} uid
 * @property {string|null} email
 * @property {string|null} displayName
 * @property {string|null} photoURL
 * @property {import('firebase/firestore').Timestamp} createdAt
 */

/**
 * @typedef {'en' | 'ar'} Locale
 */

/**
 * @typedef {'ltr' | 'rtl'} Direction
 */

export {};

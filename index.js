const express = require('express');
const bodyParser = require('body-parser');
const { GoogleAuth } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Carga las credenciales de Google Cloud
const credentials = require("./key.json");

// Configura el cliente de autenticación de Google
const httpClient = new GoogleAuth({
  credentials: credentials,
  scopes: 'https://www.googleapis.com/auth/wallet_object.issuer'
});

const app = express();
app.use(bodyParser.json());  // Asegúrate de que bodyParser está configurado para parsear JSON

app.post('/createPassObject', async (req, res) => {
  const { passType, objectId, classId, passData } = req.body;

  let newObject;
  let objectKey = `${passType}Objects`;

  switch (passType) {
    case 'evento':
      newObject = {
        id: objectId,
        classId: classId,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: passData.heroImageUrl || 'https://example.com/default_event_hero.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: passData.heroImageDescription || 'Exciting event coming up!'
            }
          }
        },
        textModulesData: passData.textModulesData || [{
          header: 'Event Details',
          body: 'Join us for an unforgettable experience!',
          id: 'eventDetails'
        }],
        linksModuleData: passData.linksModuleData || [{
          uri: 'http://example.com',
          description: 'Visit our event page for more info',
          id: 'eventLink'
        }],
        imageModulesData: passData.imageModulesData || [],
        barcode: {
          type: 'QR_CODE',
          value: 'Event12345'
        },
        locations: passData.locations || [{
          latitude: 37.7749,
          longitude: -122.4194
        }],
        ticketHolderName: passData.ticketHolderName || 'John Doe',
        ticketNumber: passData.ticketNumber || 'Ticket123'
      };
      break;

    case 'vuelo':
      newObject = {
        id: objectId,
        classId: classId,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: passData.heroImageUrl || 'https://example.com/default_flight_hero.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: passData.heroImageDescription || 'Safe and Comfortable Flights'
            }
          }
        },
        textModulesData: passData.textModulesData || [{
          header: 'Flight Information',
          body: 'Enjoy your trip with us',
          id: 'flightInfo'
        }],
        linksModuleData: passData.linksModuleData || [],
        imageModulesData: passData.imageModulesData || [],
        barcode: {
          type: 'QR_CODE',
          value: 'Flight12345'
        },
        locations: passData.locations || [],
        passengerName: passData.passengerName || 'Jane Doe',
        boardingAndSeatingInfo: {
          boardingGroup: 'B',
          seatNumber: '42A'
        },
        reservationInfo: {
          confirmationCode: 'ABC123'
        }
      };
      break;

    case 'generico':
      newObject = {
        id: objectId,
        classId: classId,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: passData.heroImageUrl || 'https://example.com/default_generic_hero.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: passData.heroImageDescription || 'Generic Event'
            }
          }
        },
        textModulesData: passData.textModulesData || [{
          header: 'Generic Information',
          body: 'Useful information for you',
          id: 'genericInfo'
        }],
        linksModuleData: passData.linksModuleData || [],
        imageModulesData: passData.imageModulesData || [],
        barcode: {
          type: 'QR_CODE',
          value: 'Generic12345'
        },
        cardTitle: {
          defaultValue: {
            language: 'en-US',
            value: passData.cardTitle || 'Generic Card'
          }
        },
        header: {
          defaultValue: {
            language: 'en-US',
            value: passData.header || 'Welcome!'
          }
        },
        hexBackgroundColor: passData.backgroundColor || '#4285F4',
        logo: {
          sourceUri: {
            uri: passData.logoUrl || 'https://example.com/default_logo.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: 'Official Logo'
            }
          }
        }
      };
      break;

    case 'giftcard':
      newObject = {
        id: objectId,
        classId: classId,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: passData.heroImageUrl || 'https://example.com/default_giftcard_hero.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: passData.heroImageDescription || 'Gift Card Image Description'
            }
          }
        },
        textModulesData: passData.textModulesData || [{
          header: 'Gift Card Details',
          body: 'Details about what the gift card can be used for',
          id: 'giftCardDetails'
        }],
        linksModuleData: passData.linksModuleData || [],
        imageModulesData: passData.imageModulesData || [],
        barcode: {
          type: 'QR_CODE',
          value: 'Gift12345'
        },
        cardNumber: passData.cardNumber || '1234567890123456',
        pin: passData.pin || '1234',
        balance: passData.balance || { micros: 50000000, currencyCode: 'USD' },
        balanceUpdateTime: {
          date: passData.balanceUpdateTime || '2024-01-01T00:00:00Z'
        }
      };
      break;

    case 'loyalty':
      newObject = {
        id: objectId,
        classId: classId,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: passData.heroImageUrl || 'https://example.com/default_loyalty_hero.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: passData.heroImageDescription || 'Loyalty Program Image'
            }
          }
        },
        textModulesData: passData.textModulesData || [{
          header: 'Loyalty Program Benefits',
          body: 'Details about loyalty benefits and how to use them',
          id: 'loyaltyInfo'
        }],
        linksModuleData: passData.linksModuleData || [],
        imageModulesData: passData.imageModulesData || [],
        barcode: {
          type: 'QR_CODE',
          value: 'Loyalty12345'
        },
        accountId: passData.accountId || 'account123456',
        accountName: passData.accountName || 'John Doe',
        loyaltyPoints: {
          label: 'Points',
          balance: {
            int: passData.loyaltyPointsBalance || 500
          }
        }
      };
      break;

    case 'offer':
      newObject = {
        id: objectId,
        classId: classId,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: passData.heroImageUrl || 'https://example.com/default_offer_hero.jpg'
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: passData.heroImageDescription || 'Special Offer Image'
            }
          }
        },
        textModulesData: passData.textModulesData || [{
          header: 'Special Offer Details',
          body: 'Details about the special offer and terms',
          id: 'offerDetails'
        }],
        linksModuleData: passData.linksModuleData || [],
        imageModulesData: passData.imageModulesData || [],
        barcode: {
          type: 'QR_CODE',
          value: 'Offer12345'
        },
        validTimeInterval: {
          start: {
            date: passData.offerStartTime || '2023-01-01T00:00:00Z'
          },
          end: {
            date: passData.offerEndTime || '2023-12-31T23:59:59Z'
          }
        }
      };
      break;
    default:
      return res.status(400).send('Tipo de pase no válido');
  }

  const claims = {
    iss: credentials.client_email,
    aud: 'google',
    origins: [],
    typ: 'savetowallet',
    payload: {
      [objectKey]: [newObject]
    }
  };

  const privateKey = credentials.private_key.replace(/\\n/g, '\n');
  const token = jwt.sign(claims, privateKey, { algorithm: 'RS256' });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

  res.send(`<a href='${saveUrl}'><img src='wallet-button.png' alt='Add to Wallet'></a>`);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

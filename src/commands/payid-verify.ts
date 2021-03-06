import {
  convertJsonToAddress,
  PaymentInformation,
  verifyPayId,
} from '@payid-org/utils'
import * as Vorpal from 'vorpal'

import Command from './Command'

/**
 * Verifies the signatures and certs for verified addresses of the currently loaded PayID.
 */
export default class VerifyPayIdCommand extends Command {
  /**
   * @override
   */
  protected async action(args: Vorpal.Args): Promise<void> {
    const info = await this.payIdFromArgsOrLocalStorage(args)
    if (verifyPayId(info)) {
      const addresses = info.verifiedAddresses.map((address) => {
        return convertJsonToAddress(address.payload)
      })
      const copy: PaymentInformation = {
        payId: info.payId,
        addresses,
        verifiedAddresses: info.verifiedAddresses,
      }
      this.logPaymentInfo(copy)
      this.vorpal.log(`Successfully verified ${copy.payId}`)
    } else {
      this.vorpal.log(`Failed to verify ${info.payId}`)
    }
  }

  /**
   * @override
   */
  protected command(): string {
    return 'verify [payId]'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'Verify the loaded PayID or an optionally specified PayID'
  }
}

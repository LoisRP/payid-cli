import {
  convertToVerifiedAddress,
  signWithKeys,
  getDefaultAlgorithm,
  IdentityKeySigningParams,
  toKey,
} from '@payid-org/utils'

import Command from './Command'

/**
 * Signs the currently loaded PayID PaymentInformation using the loaded signings keys.
 */
export default class SignPayIdCommand extends Command {
  protected async action(): Promise<void> {
    const info = this.getPaymentInfo()
    const payId = info.payId
    if (!payId) {
      this.vorpal.log('missing payid')
      return
    }
    const signingKeys = this.getSigningKey()
    if (signingKeys.length === 0) {
      this.vorpal.log(
        'you must generate or load a key before signing using ' +
          `'keys generate' or 'keys load'`,
      )
      return
    }

    const updatedAddresses = info.addresses.map((address) => {
      const jws = signWithKeys(payId, address, signingKeys)
      return convertToVerifiedAddress(jws)
    })
    const updated = {
      payId: info.payId,
      addresses: info.addresses,
      verifiedAddresses: updatedAddresses,
    }

    this.localStorage.setPaymentInfo(updated)
    this.logPaymentInfo(updated)
  }

  /**
   * @override
   */
  protected command(): string {
    return 'sign'
  }

  /**
   * @override
   */
  protected description(): string {
    return 'sign the loaded PayID with the loaded signing keys'
  }

  /**
   * Gets the signing key and converts it to SigningKeyParams.
   *
   * @returns Keys.
   */
  private getSigningKey(): IdentityKeySigningParams[] {
    const identityKeys = this.localStorage.getSigningKeys('identity-keys')
    return identityKeys.map(
      (key) =>
        new IdentityKeySigningParams(toKey(key), getDefaultAlgorithm(key)),
    )
  }
}

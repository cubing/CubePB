import { executeGiraffeql } from '~/services/giraffeql'
import { handleError } from '~/services/base'

export const flagPersonalBest = async (that, item) => {
  try {
    if (!that.$store.getters['auth/user']) {
      throw new Error('Login required')
    }

    // check for moderator
    if (
      !['ADMIN', 'MODERATOR'].includes(that.$store.getters['auth/user'].role)
    ) {
      throw new Error('Must be moderator to flag PBs')
    }

    await executeGiraffeql(that, {
      flagPersonalBest: {
        __args: {
          item: {
            id: item.id,
          },
        },
      },
    })

    that.$notifier.showSnackbar({
      message: `Flagged Personal Best`,
      variant: 'success',
    })

    that.reset({
      resetExpanded: false,
    })
  } catch (err) {
    handleError(that, err)
  }
}

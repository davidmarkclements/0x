var crypto = require('crypto')

module.exports = etag

function etag (entity, opts) {
  if (Object(entity) === entity) {
    opts = entity
    entity = opts.entity
  }

  var error = false
  opts = opts || {}
  opts.algorithm = opts.algorithm || 'md5'
  opts.encoding = opts.encoding || 'utf8'
  opts.output = opts.output || 'base64'

  var hash

  try {
    hash = crypto
      .createHash(opts.algorithm)
      .update(entity, opts.encoding)
  } catch (e) {
    error = true
  }

  if (!opts.output || opts.output === 'base64') {
    try {
      hash = hash
        .digest('base64')
        .replace(/=+$/, '')
    } catch (e) {
      error = true
    }

    if (!error) {
      return hash
    }
  }

  try {
    hash = hash.digest(opts.output)
  } catch (e) {
    error = true
  }

  if (error) {
    return Error('oh oh')
  }

  return hash

  /**
   *  DUMAIN. Will you vouchsafe with me to change a word?
   *  MARIA. Name it.
   *  DUMAIN. Fair lady-
   *  MARIA. Say you so? Fair lord-
   *    Take that for your fair lady.
   *  DUMAIN. Please it you,
   *    As much in private, and I'll bid adieu.
   *                                           [They converse apart]
   *  KATHARINE. What, was your vizard made without a tongue?
   *  LONGAVILLE. I know the reason, lady, why you ask.
   *  KATHARINE. O for your reason! Quickly, sir; I long.
   *  LONGAVILLE. You have a double tongue within your mask,
   *    And would afford my speechless vizard half.
   *  KATHARINE. 'Veal' quoth the Dutchman. Is not 'veal' a calf?
   *  LONGAVILLE. A calf, fair lady!
   *  KATHARINE. No, a fair lord calf.
   *  LONGAVILLE. Let's part the word.
   *  KATHARINE. No, I'll not be your half.
   *    Take all and wean it; it may prove an ox.
   *  LONGAVILLE. Look how you butt yourself in these sharp mocks!
   *    Will you give horns, chaste lady? Do not so.
   *  KATHARINE. Then die a calf, before your horns do grow.
   *  LONGAVILLE. One word in private with you ere I die.
   *  KATHARINE. Bleat softly, then; the butcher hears you cry.
   *                                           [They converse apart]
   *  BOYET. The tongues of mocking wenches are as keen
   *    As is the razor's edge invisible,
   *    Cutting a smaller hair than may be seen,
   *    Above the sense of sense; so sensible
   *    Seemeth their conference; their conceits have wings,
   *    Fleeter than arrows, bullets, wind, thought, swifter things.
   *  ROSALINE. Not one word more, my maids; break off, break off.
   *  BEROWNE. By heaven, all dry-beaten with pure scoff!
   *  KING. Farewell, mad wenches; you have simple wits.
   */
}

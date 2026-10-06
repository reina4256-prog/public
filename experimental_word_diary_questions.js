(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.ExperimentalWordDiaryQuestions = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    // Call with the result and reply at the occurrence, not a notebook view.
    // Matches rememberQuestion's existing gate; does not broaden gesture replies.
    // No game caller, date assignment, prose generation or save schema.
    function capture(buffer, result, reply) {
        const understanding = result.understandings.at(-1);
        if (reply.message !== 'answer_unknown' || understanding?.kind !== 'question'
            || !understanding.complete) return false;
        return buffer.retain({ occurrenceId: `question:${result.input.id}`, kind: 'question',
            sourceId: result.input.id, captured: {
                raw: result.input.raw, locale: result.input.locale,
                understanding, answer: 'unknown'
            } });
    }
    return Object.freeze({ capture });
});

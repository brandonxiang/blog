// @ts-nocheck

/**
 * @typedef {Object} PostImage
 * @property {string} url - root-relative or absolute image URL
 * @property {number=} width - intrinsic width read from the file header
 * @property {number=} height - intrinsic height read from the file header
 */

/**
 * @typedef {Object} PostType
 * @property {{date: string; title: string; description?: string}} metadata - page meta data
 * @property {string} content - a number property of SpecialType
 * @property {string=} category - category label inferred from the post directory
 * @property {{depth: number; text: string; id: string}[]=} toc - table of contents items
 * @property {string=} slug - an optional number property of SpecialType
 * @property {string=} redirect - an optional number property of SpecialType
 * @property {number=} wordCount - prose word count, code blocks excluded
 * @property {string=} lang - BCP 47 tag detected from the post body
 * @property {PostImage=} cover - first image in the post, used as the social card
 */
export {};

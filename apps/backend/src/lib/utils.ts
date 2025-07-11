export const portalLinkGenerator = (portalId: string) => {
    const BASE_URL = process.env.BASE_URL
    return `${BASE_URL}/portal/${portalId}`
}
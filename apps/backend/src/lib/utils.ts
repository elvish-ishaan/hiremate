export const portalLinkGenerator = (portalId: string, email: string) => {
    const BASE_URL = process.env.BASE_URL
    return `${BASE_URL}/invite/${portalId}?email=${encodeURIComponent(email)}`
}
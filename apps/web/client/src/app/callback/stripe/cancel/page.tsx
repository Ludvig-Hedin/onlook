import { Icons } from "@onlook/ui/icons";
import MessageScreen from "../message-screen";

export default function Cancel() {
    return (
        <MessageScreen
            title="Subscription Canceled"
            message="Your subscription to Weblab has been canceled. You can now close this page."
            icon={<Icons.CheckCircled className="size-10 text-green-500" />}
        />
    );
}
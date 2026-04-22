import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text } from
'@react-email/components';

export interface InviteUserEmailProps {
  inviteeEmail: string;
  invitedByName?: string;
  invitedByEmail: string;
  inviteLink: string;
}

export const InviteUserEmail = ({
  inviteeEmail,
  invitedByName,
  invitedByEmail,
  inviteLink
}: InviteUserEmailProps) => {
  const previewText = `Join ${invitedByName ?? invitedByEmail} on Onlook`;
  const headingText = `Join ${invitedByName ?? invitedByEmail} on Onlook`;

  return (
    <Html data-oid="873900783a">
            <Head data-oid="9c4942ef64" />
            <Tailwind data-oid="e62715925a">
                <Body className="mx-auto my-auto bg-white px-2 font-sans" data-oid="de00219db1">
                    <Preview data-oid="8f1551abeb">{previewText}</Preview>
                    <Container className="mx-auto my-[40px] max-w-[465px] rounded border border-solid border-[#eaeaea] p-[20px]" data-oid="24c67e15a2">
                        <Heading className="mx-0 my-[30px] p-0 text-center text-[24px] font-normal text-black" data-oid="edc4472282">
                            {headingText}
                        </Heading>
                        <Text className="text-[14px] leading-[24px] text-black" data-oid="bf89d32645">Hello,</Text>
                        <Text className="text-[14px] leading-[24px] text-black" data-oid="b3a8612795">
                            <Link
                href={`mailto:${invitedByEmail}`}
                className="mr-1 text-blue-600 no-underline" data-oid="97c905b918">
                
                                <strong data-oid="9569a024ee">{invitedByName ?? invitedByEmail}</strong>
                            </Link>
                            <span data-oid="eb495cfaa1">
                                has invited you to their project on <strong data-oid="386f8c8f26">Onlook</strong>.
                            </span>
                        </Text>
                        <Section className="mt-[32px] mb-[32px] text-center" data-oid="0e1e06a9db">
                            <Button
                className="rounded bg-[#000000] px-5 py-3 text-center text-[12px] font-semibold text-white no-underline"
                href={inviteLink} data-oid="df9419d810">
                
                                Join the project
                            </Button>
                        </Section>
                        <Text className="text-[14px] leading-[24px] text-black" data-oid="7e3b2e1fbe">
                            or copy and paste this URL into your browser:{' '}
                            <Link href={inviteLink} className="text-blue-600 no-underline" data-oid="23613de240">
                                {inviteLink}
                            </Link>
                        </Text>
                        <Hr className="mx-0 my-[26px] w-full border border-solid border-[#eaeaea]" data-oid="96bbff08f8" />
                        <Text className="text-[12px] leading-[24px] text-[#666666]" data-oid="62c7f7ce6b">
                            This invitation was intended for{' '}
                            <span className="text-black" data-oid="cb61f2cbb0">{inviteeEmail}</span>. If you were not
                            expecting this invitation, you can ignore this email. If you are
                            concerned about your account's safety, please reply to this email to get
                            in touch with us.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>);

};

export default InviteUserEmail;
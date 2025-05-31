import Section from "@/components/Section";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";

export const revalidate = 60; // 60 saniyede bir cache yenile

async function getContactPageContent() {
  const res = await fetch("http://cavundur.online/wp-json/wp/v2/pages?slug=contact", {
    next: { revalidate: 60 },
  });
  const data = await res.json();
  if (data && data.length > 0) {
    return {
      title: data[0].title.rendered,
      content: data[0].content.rendered,
    };
  }
  return {
    title: "İletişim",
    content: "<p>İletişim sayfası bulunamadı.</p>",
  };
}

export default function ContactPage() {
  return (
    <>
      <PageHeader
        title="İletişim"
        description="Bizimle iletişime geçmek için aşağıdaki formu kullanabilirsiniz."
        imageUrl={null}
        imageAlt="İletişim"
        titleContainerClassName="pageHeaderTitle"
      />
      <Section id="contact" isFirst={true}>
        <div className="bg-white rounded-xl p-6 shadow-md">
          <ContactForm />
        </div>
      </Section>
    </>
  );
} 
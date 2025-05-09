from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.urls import reverse
from pytils.translit import slugify

from common.utils import get_filename


class Group(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Group, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("group", kwargs={"group_slug": self.slug})


class Breeder(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Breeder, self).save(*args, **kwargs)


class Pest(models.Model):
    name = models.TextField(unique=True)

    def __str__(self):
        return self.name


class Pesticide(models.Model):
    rose = models.ForeignKey(
        "Rose", on_delete=models.CASCADE, related_name="pesticides"
    )
    pest = models.ForeignKey("Pest", on_delete=models.CASCADE, related_name="pests")
    name = models.CharField(max_length=255)
    date_added = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.pest


class Fungus(models.Model):
    name = models.TextField(unique=True)

    def __str__(self):
        return self.name


class Fungicide(models.Model):
    rose = models.ForeignKey(
        "Rose", on_delete=models.CASCADE, related_name="fungicides"
    )
    fungicide = models.ForeignKey(
        "Fungus", on_delete=models.CASCADE, related_name="fungi"
    )
    name = models.CharField(max_length=255)
    date_added = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.name


class Size(models.Model):
    rose = models.ForeignKey("Rose", on_delete=models.CASCADE, related_name="sizes")
    height = models.DecimalField(max_digits=5, decimal_places=2)
    width = models.DecimalField(max_digits=5, decimal_places=2)
    date_added = models.DateField(blank=True, null=True)


class Feeding(models.Model):
    rose = models.ForeignKey("Rose", on_delete=models.CASCADE, related_name="feedings")
    basal = models.CharField(max_length=255)
    basal_time = models.DateField(blank=True, null=True)
    leaf = models.CharField(max_length=255)
    leaf_time = models.DateField(blank=True, null=True)


class RosePhoto(models.Model):
    rose = models.ForeignKey(
        "Rose", on_delete=models.CASCADE, related_name="rosephotos"
    )
    descr = models.TextField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    photo = models.ImageField(upload_to=get_filename)


class Video(models.Model):
    rose = models.ForeignKey("Rose", on_delete=models.CASCADE, related_name="videos")
    descr = models.CharField(max_length=255, blank=True, null=True)
    video = models.URLField()


class Foliage(models.Model):
    rose = models.ForeignKey("Rose", on_delete=models.CASCADE, related_name="foliages")
    foliage = models.TextField()
    foliage_time = models.DateField(blank=True, null=True)


class Rose(models.Model):
    title = models.CharField(max_length=255, unique=True)
    title_eng = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    photo = models.ImageField(upload_to=get_filename, default="images/cap_rose.png")
    description = models.TextField(blank=True, null=True)
    landing_date = models.DateField(blank=True, null=True)
    observation = models.TextField(blank=True, null=True)
    susceptibility = models.CharField(max_length=255, blank=True, null=True)
    const_width = models.DecimalField(
        max_digits=6, decimal_places=2, blank=True, null=True
    )
    const_height = models.DecimalField(
        max_digits=6, decimal_places=2, blank=True, null=True
    )

    breeder = models.ForeignKey(
        Breeder, on_delete=models.PROTECT, related_name="roses", blank=True, null=True
    )
    group = models.ForeignKey(
        Group, on_delete=models.PROTECT, related_name="roses", blank=True, null=True
    )

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        self.slug = slugify(self.title)
        super(Rose, self).save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse("single_rose", kwargs={"rose_slug": self.slug})
